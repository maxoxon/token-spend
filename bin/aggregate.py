#!/usr/bin/env python3
"""Counts Claude Code token spend from the transcripts in ~/.claude/projects.

A turn = message.id (a transcript line is often repeated): the record with the
largest output_tokens wins. Per-file cache (size+mtime): a rerun reads only what
changed. Result: ~/.claude/token-spend/stats.json (tokens and $ at API prices).
"""
import glob, json, os, pickle, re, subprocess, sys, time
from datetime import datetime
from multiprocessing import Pool

HOME = os.path.expanduser('~')
ROOT = os.path.join(HOME, '.claude', 'projects')
OUT = os.path.join(HOME, '.claude', 'token-spend')
HERE = os.path.dirname(os.path.abspath(__file__))


def language():
    """'ru' or 'en': Claude Code's own `language` setting, then the system locale, else English."""
    def pick(v):
        v = str(v or '').lower()
        return 'ru' if v.startswith('ru') else 'en' if v.startswith('en') else ''
    try:
        found = pick(json.load(open(os.path.join(HOME, '.claude', 'settings.json'))).get('language'))
    except (OSError, ValueError, AttributeError):
        found = ''
    if not found:
        try:
            out = subprocess.run(['defaults', 'read', '-g', 'AppleLanguages'], capture_output=True, text=True, timeout=5).stdout
            found = pick(re.sub(r'[\s("]', '', out.split(',')[0]))
        except (OSError, subprocess.SubprocessError):
            pass
    return found or pick(os.environ.get('LC_ALL') or os.environ.get('LANG')) or 'en'


LANG = language()


def scan(path):
    """-> {msg_id: (ts, model, cwd, in, out, cache_read, cc5m, cc1h)} of one file."""
    recs = {}
    launch = ''
    try:
        f = open(path, encoding='utf-8', errors='replace')
    except OSError:
        return path, recs
    with f:
        for line in f:
            if '"usage"' not in line or '"assistant"' not in line:
                continue
            try:
                d = json.loads(line)
            except ValueError:
                continue
            m = d.get('message')
            if not isinstance(m, dict):
                continue
            u = m.get('usage')
            mid = m.get('id')
            if not u or not mid or m.get('model') in (None, '<synthetic>'):
                continue
            cc = u.get('cache_creation') or {}
            c1 = cc.get('ephemeral_1h_input_tokens', 0) or 0
            c5 = cc.get('ephemeral_5m_input_tokens', 0) or 0
            total_cc = u.get('cache_creation_input_tokens', 0) or 0
            if c1 + c5 < total_cc:
                c5 += total_cc - c1 - c5
            launch = launch or d.get('cwd') or ''
            r = (d.get('timestamp', ''), m['model'], '',
                 u.get('input_tokens', 0) or 0, u.get('output_tokens', 0) or 0,
                 u.get('cache_read_input_tokens', 0) or 0, c5, c1)
            old = recs.get(mid)
            if old is None or r[4] >= old[4]:
                recs[mid] = r
    # the folder a session was opened in is its first cwd; later ones are subfolders it wandered into
    return path, {k: (*v[:2], launch, *v[3:]) for k, v in recs.items()}


def project_name(cwd, folder):
    if not cwd:
        return folder
    if cwd == HOME:
        return '~ (home)' if LANG == 'en' else '~ (домашняя)'
    p = cwd[len(HOME) + 1:] if cwd.startswith(HOME + '/') else cwd
    if '/.claude/worktrees/' in p or '/.claude-worktrees/' in p:
        p = p.split('/.claude')[0]
    if p.startswith('/private/tmp') or p.startswith('/tmp'):
        return 'tmp (sandboxes)' if LANG == 'en' else 'tmp (песочницы)'
    return os.path.basename(p) or folder


def price_for(model, prices):
    best = None
    for k in prices['models']:
        if model.startswith(k) and (best is None or len(k) > len(best)):
            best = k
    return prices['models'][best] if best else None


def main():
    os.makedirs(OUT, exist_ok=True)
    cache_path = os.path.join(OUT, 'cache.pkl')
    try:
        cache = pickle.load(open(cache_path, 'rb'))
    except Exception:
        cache = {}
    files = glob.glob(os.path.join(ROOT, '**', '*.jsonl'), recursive=True)
    todo, keep = [], {}
    for p in files:
        try:
            st = os.stat(p)
        except OSError:
            continue
        key = (st.st_size, int(st.st_mtime), 2)  # 2: cwd is the launch folder
        if p in cache and cache[p][0] == key:
            keep[p] = cache[p]
        else:
            todo.append((p, key))
    t0 = time.time()
    keys = dict(todo)
    if todo:
        with Pool(min(8, os.cpu_count() or 4)) as pool:
            for p, recs in pool.imap_unordered(scan, [p for p, _ in todo], chunksize=4):
                keep[p] = (keys[p], recs)
    tmp = f'.{os.getpid()}.tmp'  # per-process name: two runs at once (panel start + button) must not share one
    pickle.dump(keep, open(cache_path + tmp, 'wb'))
    os.replace(cache_path + tmp, cache_path)

    prices = json.load(open(os.path.join(HERE, '..', 'prices.json')))
    best = {}
    for p, (_, recs) in keep.items():
        folder = os.path.basename(os.path.dirname(p))
        for mid, r in recs.items():
            o = best.get(mid)
            if o is None or r[4] > o[0][4]:
                best[mid] = (r, folder)

    rows = {}  # (day, model, project) -> [n, in, out, cr, cc5, cc1, usd]
    unpriced = {}
    for r, folder in best.values():
        ts, model, cwd, i, o, cr, c5, c1 = r
        try:
            day = datetime.fromisoformat(ts.replace('Z', '+00:00')).astimezone().strftime('%Y-%m-%d')
        except ValueError:
            continue
        pr = price_for(model, prices)
        if pr is None:
            usd = 0.0
            unpriced[model] = unpriced.get(model, 0) + 1
        else:
            usd = (i * pr['in'] + o * pr['out'] + cr * pr['in'] * pr.get('cache_read', prices['cache_read'])
                   + c5 * pr['in'] * prices['cache_5m'] + c1 * pr['in'] * prices['cache_1h']) / 1e6
        k = (day, model, project_name(cwd, folder))
        a = rows.setdefault(k, [0, 0, 0, 0, 0, 0, 0.0])
        for n, v in enumerate((1, i, o, cr, c5, c1, usd)):
            a[n] += v

    out = {
        'generated': datetime.now().astimezone().isoformat(timespec='seconds'),
        'lang': LANG, 'files': len(keep), 'turns': len(best), 'unpriced': unpriced,
        'rows': [list(k) + [round(v, 4) if n == 6 else v for n, v in enumerate(a)] for k, a in sorted(rows.items())],
    }
    stats_path = os.path.join(OUT, 'stats.json')
    json.dump(out, open(stats_path + tmp, 'w'), ensure_ascii=False, separators=(',', ':'))
    os.replace(stats_path + tmp, stats_path)
    print(f"files={len(keep)} rescanned={len(todo)} turns={len(best)} rows={len(rows)} "
          f"unpriced={unpriced} sec={time.time() - t0:.1f}")


if __name__ == '__main__':
    sys.exit(main())
