export type Row = [string, string, string, number, number, number, number, number, number, number]
export type PeriodId = 'day' | 'week' | 'month' | 'all'
export type Scheme = 'dark' | 'light' | 'auto'

export type Lang = 'en' | 'ru'
const S = {
  en: {
    p_day: '24 h', p_week: '7 days', p_month: '30 days', p_all: 'all time',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], wd3: ['Mon', 'Wed', 'Fri'],
    bn: 'B', mn: 'M', k: 'k',
    tokens: 'Tokens', usdTitle: 'Equivalent in $ · API prices', perDay: 'per day', vsPrev: 'vs previous', since: 'since',
    today: 'today', other: 'Other', noSpend: 'no spend', noSpendDay: 'No spend on this day',
    byModel: 'BY MODEL', byProject: 'BY PROJECT', pairs: 'MODEL ON PROJECT', on: 'on',
    bestDay: 'Most expensive day', activeDays: 'Active days', of: 'of', avgActive: 'Average per active day', avgShort: 'Avg per active day',
    heightSingle: 'fill height — spend per day', heightMulti: 'height — spend per day, colour — project',
    altDaily: 'Spend per day, by model', altDay: 'Day breakdown', altModels: 'Model share of spend',
    altShare: 'share of spend', altCal: 'Spend calendar by day',
    title: 'Token spend', cmdDesc: 'Token spend panel: periods, models, projects, $', cmdDone: 'Panel opened, recalculating.',
    busy: 'Counting spend from transcripts…', none: 'No data.', refresh: 'refresh', updated: 'updated', counting: 'counting…', recalc: 'recalculate',
    project: 'Project', day: 'Day', wholePeriod: 'whole period', spendByDay: 'Spend by day', activity: 'Activity', models: 'Models', modelsIn: 'Models · in project',
    projects: 'Projects', calendar: 'Calendar', dayBreak: 'Day breakdown', ofSpend: 'of spend', moreA: '', moreB: ' more projects', footA: '$ at API prices · since', footB: 'turns',
    altTokens: 'Tokens and dollar equivalent',
  },
  ru: {
    p_day: 'сутки', p_week: '7 дней', p_month: '30 дней', p_all: 'всё время',
    months: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    wd: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'], wd3: ['Пн', 'Ср', 'Пт'],
    bn: 'млрд', mn: 'млн', k: 'тыс',
    tokens: 'Токены', usdTitle: 'Эквивалент в $ · по API', perDay: 'в день', vsPrev: 'к предыдущим', since: 'с',
    today: 'сегодня', other: 'Прочие', noSpend: 'нет расхода', noSpendDay: 'В этот день расхода нет',
    byModel: 'ПО МОДЕЛЯМ', byProject: 'ПО ПРОЕКТАМ', pairs: 'СВЯЗКИ: МОДЕЛЬ НА ПРОЕКТЕ', on: 'на',
    bestDay: 'Самый дорогой день', activeDays: 'Активных дней', of: 'из', avgActive: 'В среднем за активный день', avgShort: 'Среднее за акт. день',
    heightSingle: 'высота закраски — расход за день', heightMulti: 'высота — расход за день, цвет — проект',
    altDaily: 'Расход по дням, по моделям', altDay: 'Разбор дня', altModels: 'Доли моделей в расходе',
    altShare: 'доля расхода', altCal: 'Календарь расхода по дням',
    title: 'Расход токенов', cmdDesc: 'Панель расхода токенов: периоды, модели, проекты, $', cmdDone: 'Панель расхода открыта, пересчитываю.',
    busy: 'Считаю расход по стенограммам…', none: 'Нет данных.', refresh: 'обновить', updated: 'обновлено', counting: 'считаю…', recalc: 'пересчитать',
    project: 'Проект', day: 'День', wholePeriod: 'весь период', spendByDay: 'Расход по дням', activity: 'Активность', models: 'Модели', modelsIn: 'Модели · в проекте',
    projects: 'Проекты', calendar: 'Календарь', dayBreak: 'Разбор дня', ofSpend: 'расхода', moreA: 'ещё ', moreB: ' проектов', footA: '$ по API-ценам · с', footB: 'ходов',
    altTokens: 'Токены и эквивалент в долларах',
  },
}
let lang: Lang = 'en'
export const setLang = (l: string) => void (lang = l === 'ru' ? 'ru' : 'en')
export const t = <K extends keyof typeof S.en>(k: K): (typeof S.en)[K] => S[lang][k]

export const PERIODS: Record<PeriodId, { label: string; days: number }> = {
  day: { get label() { return t('p_day') }, days: 1 },
  week: { get label() { return t('p_week') }, days: 7 },
  month: { get label() { return t('p_month') }, days: 30 },
  all: { get label() { return t('p_all') }, days: 0 },
}

const NB = ' '

const p2 = (n: number) => String(n).padStart(2, '0')
const dateOf = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}
export const ymd = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
export const shift = (s: string, n: number) => {
  const d = dateOf(s)
  d.setDate(d.getDate() + n)
  return ymd(d)
}
export const dayLabel = (s: string) => {
  const d = dateOf(s)
  return lang === 'ru' ? `${d.getDate()}${NB}${t('months')[d.getMonth()]}` : `${t('months')[d.getMonth()]}${NB}${d.getDate()}`
}
export const dayFull = (s: string) => `${dayLabel(s)}, ${t('wd')[dateOf(s).getDay()]}`
const diffDays = (a: string, b: string) => Math.round((dateOf(b).getTime() - dateOf(a).getTime()) / 864e5)

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const tokens = (r: Row) => r[4] + r[5] + r[6] + r[7] + r[8]
const sep = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, NB)

export const fmtUsd = (n: number) => `$${n < 10 ? n.toFixed(2) : sep(String(Math.round(n)))}`
export const fmtTok = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)}${NB}${t('bn')}` : n >= 1e6 ? `${(n / 1e6).toFixed(1)}${NB}${t('mn')}` : n >= 1e3 ? `${Math.round(n / 1e3)}${NB}${t('k')}` : `${n}`

const SHADES: [RegExp, string][] = [
  [/sonnet-5-5/, '#3987e5'],
  [/sonnet/, '#86b6f0'],
  [/opus-5-5/, '#7a67e0'],
  [/opus/, '#b4abf2'],
  [/haiku-5/, '#1baf7a'],
  [/haiku/, '#7dd4b3'],
  [/fable|mythos/, '#eda100'],
]
export const modelColor = (m: string) => SHADES.find(([re]) => re.test(m))?.[1] ?? '#898781'
export const modelName = (m: string) => {
  const s = m.replace(/^claude-/, '').replace(/-\d{8}$/, '')
  const x = /^([a-z]+)-(\d+)(?:-(\d+))?$/.exec(s)
  return x ? `${x[1][0].toUpperCase()}${x[1].slice(1)} ${x[2]}${x[3] ? `.${x[3]}` : ''}` : s
}

const GREY = '#898781'
const PCOL = ['#f08a4b', '#e0527e', '#d4b13a', '#7bc96f', '#4cc3d9', '#c27ae0']
export type PColors = Map<string, string>
export const projectColors = (rows: Row[]): PColors => {
  const m: PColors = new Map()
  groupBy(rows, 2).slice(0, PCOL.length).forEach((g, i) => m.set(g.name, PCOL[i]))
  return m
}
const pcol = (m: PColors, name: string) => m.get(name) ?? GREY

const PAL = {
  dark: { tx: '#f0efec', tx2: '#c3c2b7', tx3: '#898781', grid: '#2c2c2a', base: '#383835', tile: '#242423', bd: 'rgba(255,255,255,.10)', empty: '#2c2c2a', hov: 'rgba(255,255,255,.08)' },
  light: { tx: '#0b0b0b', tx2: '#52514e', tx3: '#898781', grid: '#e1e0d9', base: '#c3c2b7', tile: '#f1efe8', bd: 'rgba(11,11,11,.10)', empty: '#e9e8e2', hov: 'rgba(11,11,11,.06)' },
}
const decl = (c: typeof PAL.dark) =>
  `--tx:${c.tx};--tx2:${c.tx2};--tx3:${c.tx3};--grid:${c.grid};--base:${c.base};--tile:${c.tile};--bd:${c.bd};--empty:${c.empty};--hov:${c.hov}`

const style = (scheme: Scheme) =>
  `<style>${scheme === 'auto' ? `.tm{${decl(PAL.light)}}@media(prefers-color-scheme:dark){.tm{${decl(PAL.dark)}}}` : `.tm{${decl(PAL[scheme])}}`}` +
  `.tm text{font-family:-apple-system,"SF Pro Text",system-ui,sans-serif;font-size:11px;fill:var(--tx3)}` +
  `.tm .tx{fill:var(--tx)}.tm .tx2{fill:var(--tx2)}.tm .b{font-weight:600}.tm .n{font-variant-numeric:tabular-nums}` +
  `.tm .hero{font-family:"New York",ui-serif,Georgia,serif;font-size:34px;fill:var(--tx);font-weight:500}` +
  `.tm .grid{stroke:var(--grid);stroke-width:1}.tm .base{stroke:var(--base);stroke-width:1}` +
  `.tm .tile{fill:var(--tile);stroke:var(--bd)}.tm .hit{fill:transparent}.tm .hit:hover{fill:var(--hov)}</style>`

const svg = (w: number, h: number, body: string, scheme: Scheme, alt: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" class="tm" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(alt)}">${style(scheme)}${body}</svg>`

const niceMax = (v: number) => {
  if (v <= 0) return 1
  const e = 10 ** Math.floor(Math.log10(v))
  const f = v / e
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e
}

export const inPeriod = (rows: Row[], today: string, period: PeriodId) => {
  const d = PERIODS[period].days
  const from = d === 0 ? '' : shift(today, -(d - 1))
  return rows.filter(r => r[0] >= from && r[0] <= today)
}
export const sumUsd = (rows: Row[]) => rows.reduce((a, r) => a + r[9], 0)
export const sumTok = (rows: Row[]) => rows.reduce((a, r) => a + tokens(r), 0)

export const groupBy = (rows: Row[], col: 1 | 2) => {
  const m = new Map<string, { tok: number; usd: number }>()
  for (const r of rows) {
    const g = m.get(r[col]) ?? { tok: 0, usd: 0 }
    g.tok += tokens(r)
    g.usd += r[9]
    m.set(r[col], g)
  }
  return [...m.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.usd - a.usd)
}

type G = { name: string; tok: number; usd: number }
const OTHER = '\u0000other'
const topN = (g: G[], n: number): G[] => {
  const rest = g.slice(n)
  return rest.length ? [...g.slice(0, n), { name: OTHER, tok: rest.reduce((a, x) => a + x.tok, 0), usd: rest.reduce((a, x) => a + x.usd, 0) }] : g
}

export function kpiSvg(rows: Row[], today: string, period: PeriodId, w: number, scheme: Scheme) {
  const cur = inPeriod(rows, today, period)
  const usd = sumUsd(cur)
  const tok = sumTok(cur)
  const days = PERIODS[period].days || Math.max(1, diffDays(rows[0]?.[0] ?? today, today) + 1)
  let delta = ''
  if (PERIODS[period].days > 0) {
    const prev = sumUsd(rows.filter(r => r[0] >= shift(today, -(2 * days - 1)) && r[0] <= shift(today, -days)))
    if (prev > 0) {
      const pct = Math.round(((usd - prev) / prev) * 100)
      const up = pct >= 0
      delta = `<text x="16" y="82" style="fill:${up ? '#eda100' : '#1baf7a'}">${up ? '▲' : '▼'} ${Math.abs(pct)}% ${t('vsPrev')} ${PERIODS[period].label}</text>`
    }
  } else delta = `<text x="16" y="82">${t('since')} ${dayLabel(rows[0]?.[0] ?? today)}</text>`
  const [num, unit] = fmtTok(tok).split(NB)
  const tw = Math.floor((w - 12) / 2)
  const x2 = w - tw
  const body =
    `<rect class="tile" x=".5" y=".5" width="${tw - 1}" height="96" rx="12"/>` +
    `<text x="16" y="24">${t('tokens')} · ${PERIODS[period].label}</text>` +
    `<text class="hero" x="16" y="62">${num}</text><text x="${16 + num.length * 17 + 6}" y="62" class="tx2" style="font-size:14px">${unit ?? ''}</text>` +
    delta +
    `<rect class="tile" x="${x2 + .5}" y=".5" width="${tw - 1}" height="96" rx="12"/>` +
    `<text x="${x2 + 16}" y="24">${t('usdTitle')}</text>` +
    `<text class="hero" x="${x2 + 16}" y="62">${fmtUsd(usd)}</text>` +
    `<text x="${x2 + 16}" y="82">≈ ${fmtUsd(usd / days)} ${t('perDay')}</text>`
  return svg(w, 98, body, scheme, `${t('tokens')} ${fmtTok(tok)}, ${fmtUsd(usd)}`)
}

export function dailySvg(rows: Row[], today: string, period: PeriodId, w: number, scheme: Scheme, sel: string) {
  const first = rows[0]?.[0] ?? today
  const N = period === 'all' ? Math.max(30, Math.min(diffDays(first, today) + 1, 120)) : 30
  const L = 48, R = 4, top = 34, ph = 118, H = top + ph + 30
  const days = Array.from({ length: N }, (_, i) => shift(today, -(N - 1 - i)))
  const order = groupBy(rows, 1).map(g => g.name)
  const cell = new Map<string, Map<string, number>>()
  for (const r of rows) {
    if (r[0] < days[0] || r[0] > today) continue
    const m = cell.get(r[0]) ?? new Map()
    m.set(r[1], (m.get(r[1]) ?? 0) + r[9])
    cell.set(r[0], m)
  }
  const totals = days.map(d => [...(cell.get(d)?.values() ?? [])].reduce((a, b) => a + b, 0))
  const max = niceMax(Math.max(...totals))
  const slot = (w - L - R) / N
  const bw = Math.max(2, Math.min(22, slot - 3))
  const dd = PERIODS[period].days
  const from = dd === 0 ? '' : shift(today, -(dd - 1))
  let b = ''
  for (const t of [0, 0.5, 1]) {
    const y = top + ph - t * ph
    b += `<line class="${t === 0 ? 'base' : 'grid'}" x1="${L}" x2="${w - R}" y1="${y}" y2="${y}"/><text x="${L - 6}" y="${y + 4}" text-anchor="end" class="n">${t === 0 ? '$0' : fmtUsd(max * t)}</text>`
  }
  let lx = L
  for (const m of order.slice(0, 5)) {
    if (lx + 12 + modelName(m).length * 6 > w) break
    b +=`<rect x="${lx}" y="6" width="8" height="8" rx="2" fill="${modelColor(m)}"/><text x="${lx + 12}" y="14">${esc(modelName(m))}</text>`
    lx += 12 + modelName(m).length * 6 + 14
  }
  days.forEach((day, i) => {
    const x = L + i * slot + (slot - bw) / 2
    let y = top + ph
    const inP = day >= from
    if (day === sel) b += `<rect x="${(L + i * slot).toFixed(1)}" y="${top - 6}" width="${slot.toFixed(1)}" height="${ph + 12}" rx="4" fill="var(--hov)" stroke="var(--tx2)" stroke-width="1"/>`
    for (const m of order) {
      const v = cell.get(day)?.get(m) ?? 0
      if (v <= 0) continue
      const h = Math.max(1.5, (v / max) * ph)
      y -= h
      b += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, h - 1).toFixed(1)}" rx="${Math.min(2, bw / 3).toFixed(1)}" fill="${modelColor(m)}" opacity="${inP ? 1 : 0.35}"/>`
    }
    const tip = [`${dayFull(day)} — ${fmtUsd(totals[i])}`, ...order.filter(m => (cell.get(day)?.get(m) ?? 0) > 0.005).map(m => `${modelName(m)} · ${fmtUsd(cell.get(day)!.get(m)!)}`)].join('\n')
    b += `<rect class="hit" x="${(L + i * slot).toFixed(1)}" y="${top - 4}" width="${slot.toFixed(1)}" height="${ph + 8}" rx="3"><title>${esc(tip)}</title></rect>`
  })
  const ay = top + ph + 18
  b += `<text x="${L}" y="${ay}">${dayLabel(days[0])}</text><text x="${L + (w - L - R) / 2}" y="${ay}" text-anchor="middle">${dayLabel(days[Math.floor(N / 2)])}</text><text x="${w - R}" y="${ay}" text-anchor="end">${t('today')}</text>`
  return svg(w, H, b, scheme, t('altDaily'))
}

type Item = { label: string; color: string; usd: number; tok: number }
const barList = (x: number, y: number, cw: number, title: string, items: Item[], total: number) => {
  const top = items[0]?.usd || 1
  let s = `<text x="${x}" y="${y}" style="letter-spacing:.06em">${title}</text>`
  items.forEach((it, i) => {
    const yy = y + 24 + i * 46
    s += `<text x="${x}" y="${yy}" class="tx">${esc(it.label)}</text><text x="${x + cw}" y="${yy}" text-anchor="end" class="tx b n">${fmtUsd(it.usd)}</text>` +
      `<rect x="${x}" y="${yy + 7}" width="${cw}" height="6" rx="3" fill="var(--grid)"/><rect x="${x}" y="${yy + 7}" width="${Math.max(6, (it.usd / top) * cw).toFixed(1)}" height="6" rx="3" fill="${it.color}"/>` +
      `<text x="${x}" y="${yy + 28}">${fmtTok(it.tok)} · ${Math.round((it.usd / (total || 1)) * 100)}%</text>`
  })
  return { s, h: 24 + items.length * 46 }
}

export function dayDetailSvg(rows: Row[], day: string, w: number, scheme: Scheme, pc: PColors) {
  const dr = rows.filter(r => r[0] === day)
  const usd = sumUsd(dr)
  const head = `<text x="16" y="30" class="tx b" style="font-size:15px">${dayFull(day)}</text>`
  if (!dr.length)
    return svg(w, 64, `<rect class="tile" x=".5" y=".5" width="${w - 1}" height="63" rx="12"/>${head}<text x="16" y="50">${t('noSpendDay')}</text>`, scheme, t('altDay'))
  const tok = sumTok(dr)
  const models: Item[] = topN(groupBy(dr, 1), 5).map(g => ({ label: g.name === OTHER ? t('other') : modelName(g.name), color: g.name === OTHER ? GREY : modelColor(g.name), usd: g.usd, tok: g.tok }))
  const projects: Item[] = topN(groupBy(dr, 2), 5).map(g => ({ label: g.name === OTHER ? t('other') : g.name, color: g.name === OTHER ? GREY : pcol(pc, g.name), usd: g.usd, tok: g.tok }))
  const wide = w >= 560
  const inner = w - 32
  let b = head + `<text x="${w - 16}" y="30" text-anchor="end" class="tx b n" style="font-size:15px">${fmtUsd(usd)}</text><text x="${w - 16}" y="46" text-anchor="end">${fmtTok(tok)}</text>`
  let y = 74
  if (wide) {
    const cw = Math.floor((inner - 28) / 2)
    const a = barList(16, y, cw, t('byModel'), models, usd)
    const c = barList(16 + cw + 28, y, cw, t('byProject'), projects, usd)
    b += a.s + c.s
    y += Math.max(a.h, c.h) + 10
  } else {
    const a = barList(16, y, inner, t('byModel'), models, usd)
    b += a.s
    y += a.h + 14
    const c = barList(16, y, inner, t('byProject'), projects, usd)
    b += c.s
    y += c.h + 10
  }
  const pairs = new Map<string, number>()
  for (const r of dr) pairs.set(`${r[1]}\u0000${r[2]}`, (pairs.get(`${r[1]}\u0000${r[2]}`) ?? 0) + r[9])
  const pl = [...pairs.entries()].sort((a, c) => c[1] - a[1]).slice(0, 6)
  b += `<line class="grid" x1="16" x2="${w - 16}" y1="${y - 4}" y2="${y - 4}"/><text x="16" y="${y + 16}" style="letter-spacing:.06em">${t('pairs')}</text>`
  pl.forEach(([k, v], i) => {
    const [m, p] = k.split('\u0000')
    const yy = y + 40 + i * 24
    b += `<circle cx="20" cy="${yy - 4}" r="4" fill="${modelColor(m)}"/><circle cx="32" cy="${yy - 4}" r="4" fill="${pcol(pc, p)}"/>` +
      `<text x="46" y="${yy}" class="tx">${esc(modelName(m))} <tspan class="tx2">${t('on')}</tspan> ${esc(p)}</text><text x="${w - 16}" y="${yy}" text-anchor="end" class="tx b n">${fmtUsd(v)}</text>`
  })
  const H = y + 40 + pl.length * 24 + 4
  return svg(w, H, `<rect class="tile" x=".5" y=".5" width="${w - 1}" height="${H - 1}" rx="12"/>${b}`, scheme, `${t('altDay')} ${dayFull(day)}`)
}

export function modelsSvg(rows: Row[], today: string, period: PeriodId, w: number, scheme: Scheme) {
  const cur = inPeriod(rows, today, period)
  const total = sumUsd(cur) || 1
  const items = topN(groupBy(cur, 1), 5)
  const r = 46, cx = 62, cy = 64, C = 2 * Math.PI * r
  let b = '', start = 0
  for (const it of items) {
    const len = (it.usd / total) * C
    const gap = items.length > 1 ? 2 : 0
    b += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${it.name === OTHER ? GREY : modelColor(it.name)}" stroke-width="16" stroke-dasharray="${Math.max(0.1, len - gap).toFixed(2)} ${(C - len + gap).toFixed(2)}" stroke-dashoffset="${(-start).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"><title>${esc(modelName(it.name))} · ${fmtUsd(it.usd)} · ${Math.round((it.usd / total) * 100)}%</title></circle>`
    start += len
  }
  b += `<text x="${cx}" y="${cy + 2}" text-anchor="middle" class="tx b n" style="font-size:16px">${fmtUsd(sumUsd(cur))}</text><text x="${cx}" y="${cy + 18}" text-anchor="middle">${PERIODS[period].label}</text>`
  items.forEach((it, i) => {
    const y = 20 + i * 30
    b += `<circle cx="146" cy="${y - 4}" r="4" fill="${it.name === OTHER ? GREY : modelColor(it.name)}"/>` +
      `<text x="158" y="${y}" class="tx">${esc(it.name === OTHER ? t('other') : modelName(it.name))}</text>` +
      `<text x="${w}" y="${y}" text-anchor="end" class="tx b n">${fmtUsd(it.usd)}</text>` +
      `<text x="158" y="${y + 14}">${fmtTok(it.tok)} · ${Math.round((it.usd / total) * 100)}%</text>`
  })
  return svg(w, Math.max(136, 28 + items.length * 30), b, scheme, t('altModels'))
}

export const barSvg = (frac: number, w: number, color: string, scheme: Scheme) =>
  svg(w, 8, `<rect y="1" width="${w}" height="6" rx="3" fill="var(--grid)"/><rect y="1" width="${Math.max(6, frac * w).toFixed(1)}" height="6" rx="3" fill="${color}"/>`, scheme, t('altShare'))

export function heatSvg(rows: Row[], first: string, today: string, w: number, scheme: Scheme, pc: PColors, sel: string, single: boolean) {
  const byDay = new Map<string, Row[]>()
  for (const r of rows) {
    const a = byDay.get(r[0]) ?? []
    a.push(r)
    byDay.set(r[0], a)
  }
  const dayUsd = (d: string) => sumUsd(byDay.get(d) ?? [])
  const start = shift(first, -((dateOf(first).getDay() + 6) % 7))
  const weeks = Math.floor(diffDays(start, today) / 7) + 1
  const wide = w >= 560
  const L = 28
  const pitch = Math.max(16, Math.min(40, Math.floor((w - L - (wide ? 190 : 0)) / weeks)))
  const cell = pitch - 3
  const max = Math.max(...[...byDay.keys()].map(dayUsd), 1)
  let b = ''
  ;t('wd3').forEach((t, i) => (b += `<text x="0" y="${22 + i * 2 * pitch + cell / 2 + 4}">${t}</text>`))
  let id = 0
  for (let wk = 0; wk < weeks; wk++) {
    const m0 = dateOf(shift(start, wk * 7)).getMonth()
    if (wk === 0 || m0 !== dateOf(shift(start, (wk - 1) * 7)).getMonth()) b += `<text x="${L + wk * pitch}" y="12">${t('months')[m0]}</text>`
    for (let r = 0; r < 7; r++) {
      const day = shift(start, wk * 7 + r)
      if (day > today || day < first) continue
      const x = L + wk * pitch, y = 22 + r * pitch
      const dr = byDay.get(day) ?? []
      const v = sumUsd(dr)
      let inner = `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="4" fill="var(--empty)"/>`
      if (v > 0) {
        const hh = Math.max(0.3, v / max) * cell
        let yy = y + cell
        let segs = ''
        for (const g of groupBy(dr, 2)) {
          const h = (hh * g.usd) / v
          yy -= h
          segs += `<rect x="${x}" y="${yy.toFixed(1)}" width="${cell}" height="${h.toFixed(1)}" fill="${pcol(pc, g.name)}"/>`
        }
        const cid = `c${id++}`
        inner += `<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="4"/></clipPath><g clip-path="url(#${cid})">${segs}</g>`
      }
      const tip = [`${dayFull(day)} — ${v > 0 ? fmtUsd(v) : t('noSpend')}`, ...groupBy(dr, 2).slice(0, 5).map(g => `${g.name} · ${fmtUsd(g.usd)}`)].join('\n')
      const ring = day === sel ? `<rect x="${x - 2}" y="${y - 2}" width="${cell + 4}" height="${cell + 4}" rx="6" fill="none" stroke="var(--tx)" stroke-width="1.5"/>` : ''
      b += `${inner}${ring}<rect class="hit" x="${x}" y="${y}" width="${cell}" height="${cell}" rx="4"><title>${esc(tip)}</title></rect>`
    }
  }
  const bottom = 22 + 7 * pitch
  const span = diffDays(first, today) + 1
  const act = [...byDay.keys()].filter(d => dayUsd(d) > 0)
  const best = act.sort((a, c) => dayUsd(c) - dayUsd(a))[0]
  const stats: [string, string][] = [
    [t('bestDay'), best ? `${dayLabel(best)} · ${fmtUsd(dayUsd(best))}` : '—'],
    [t('activeDays'), `${act.length} ${t('of')} ${span}`],
    [t('avgActive'), fmtUsd(sumUsd(rows) / Math.max(1, act.length))],
  ]
  let H = bottom
  if (wide) {
    const x0 = L + weeks * pitch + 24
    stats.forEach(([k, v], i) => (b += `<text x="${x0}" y="${34 + i * 46}">${k}</text><text x="${x0}" y="${52 + i * 46}" class="tx b n" style="font-size:14px">${v}</text>`))
  } else {
    const cw = (w - L) / 3
    stats.forEach(([k, v], i) => (b += `<text x="${L + i * cw}" y="${bottom + 14}">${k === t('avgActive') ? t('avgShort') : k}</text><text x="${L + i * cw}" y="${bottom + 32}" class="tx b n" style="font-size:13px">${v}</text>`))
    H = bottom + 40
  }
  const ly = H + 14
  if (single) b += `<text x="${L}" y="${ly}">${t('heightSingle')}</text>`
  else {
    b += `<text x="${L}" y="${ly}">${t('heightMulti')}</text>`
    let lx = L + 4, ry = ly + 20
    for (const [name, c] of pc) {
      if (lx + name.length * 6 + 24 > w) {
        lx = L + 4
        ry += 18
      }
      b += `<circle cx="${lx}" cy="${ry - 4}" r="4" fill="${c}"/><text x="${lx + 8}" y="${ry}">${esc(name)}</text>`
      lx += 8 + name.length * 6 + 16
    }
    return svg(w, ry + 8, b, scheme, t('altCal'))
  }
  return svg(w, ly + 8, b, scheme, t('altCal'))
}
