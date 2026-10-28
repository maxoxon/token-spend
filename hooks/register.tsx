import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Period, Stats, View } from '../types'
import {
  PERIODS, barSvg, dailySvg, dayDetailSvg, dayFull, fmtTok, fmtUsd, groupBy, heatSvg, inPeriod, kpiSvg,
  modelsSvg, projectColors, setLang, shift, sumTok, sumUsd, t, ymd,
} from './charts'

const PANE = 'token-spend'
const stats = atom({ plugin: 'token-spend', key: 'stats' } as const, null)
const view = atom({ plugin: 'token-spend', key: 'view' } as const, {
  period: 'week',
  project: '',
  day: '',
  busy: false,
  error: '',
})

const ORDER: { id: Period; key: string }[] = [
  { id: 'day', key: '1' },
  { id: 'week', key: '2' },
  { id: 'month', key: '3' },
  { id: 'all', key: '4' },
]

// pixels per character cell of the pane: calibrated on screenshots at 70 and 137 cells
const PX_PER_COL = 7.8
const MIN_W = 300
const MAX_W = 1400

const home = (root: string) => root.slice(0, root.indexOf('/.claude/'))

async function load($: any) {
  const text = await $.fs.read(`${home($.plugin.root)}/.claude/token-spend/stats.json`)
  await update($, stats, () => JSON.parse(text) as Stats)
}

async function refresh($: any) {
  await update($, view, (v: View) => ({ ...v, busy: true, error: '' }))
  try {
    const r = await $.process.run(['python3', '-I', `${$.plugin.root}/bin/aggregate.py`], { timeoutMs: 600000 })
    if (r.exitCode !== 0) throw new Error(String(r.stderr).slice(-200))
    await load($)
    await update($, view, (v: View) => ({ ...v, busy: false }))
  } catch (err) {
    await update($, view, (v: View) => ({ ...v, busy: false, error: String((err as Error).message ?? err) }))
  }
}

// sizes taken from the markup itself: without them the pane fits the picture into the leftover space and shrinks it
const size = (source: string) => {
  const m = /<svg[^>]*?\swidth="(\d+)"[^>]*?\sheight="(\d+)"/.exec(source)
  return m ? { width: Number(m[1]), height: Number(m[2]) } : {}
}

const patch = ($: any, p: Partial<View>) => update($, view, (s: View) => ({ ...s, ...p }))

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await load($).catch(() => {})
    setLang((await read($, stats))?.lang)
    await $.command.register({ name: 'tokens', description: t('cmdDesc') })
    void $.ui.open({ id: PANE, title: t('title') })
    void refresh($)

    return next(e)
  })

  on('command.run', { command: 'tokens' }, async $ => {
    await $.ui.open({ id: PANE, title: t('title') })
    void refresh($)

    return { text: t('cmdDone') }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Svg, Select } = $.ui.resolve(e) as any
    const data = await read($, stats)
    const v = await read($, view)

    if (!data) {
      return (
        <Box flexDirection="column">
          <Text>{v.busy ? t('busy') : t('none')}</Text>
          {v.error !== '' && <Text color="red">{v.error}</Text>}
          <Button hotkey="r" onPress={() => void refresh($)}>{t('refresh')}</Button>
        </Box>
      )
    }

    setLang(data.lang)
    const today = ymd(new Date())
    const all = data.rows
    const first = all[0]?.[0] ?? today
    const period = v.period
    // state survives a mod reload: an old record lacks these fields
    // a project chosen before a rename (or never in the data) is dropped instead of showing an empty slice
    const project = all.some(r => r[2] === v.project) ? v.project : ''
    const day = v.day ?? ''
    const draw = e.surface !== 'terminal'
    const cols = e.props?.bodyColumns ?? 52
    const W = Math.max(MIN_W, Math.min(MAX_W, Math.round(cols * PX_PER_COL)))
    const wide = W >= 560
    const half = Math.floor((W - 16) / 2)
    const rows = project ? all.filter(r => r[2] === project) : all
    const pc = projectColors(all)
    const turns = String(data.turns).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

    const dayRows = inPeriod(all, today, 'month')
    const dayUsd = new Map<string, number>()
    for (const r of dayRows) dayUsd.set(r[0], (dayUsd.get(r[0]) ?? 0) + r[9])
    const dayOptions = [
      { value: '', label: t('wholePeriod') },
      ...Array.from({ length: 30 }, (_, i) => shift(today, -i)).map(d => ({
        value: d,
        label: `${dayFull(d)} · ${fmtUsd(dayUsd.get(d) ?? 0)}`,
      })),
    ]
    const step = (n: number) => {
      const t = day === '' ? today : shift(day, n)
      void patch($, { day: t > today ? today : t < first ? first : t })
    }

    const cur = inPeriod(all, today, period)
    const plist = groupBy(cur, 2)
    const ptop = plist[0]?.usd || 1
    const ptotal = sumUsd(cur) || 1
    const projectList = (w: number) => (
      <Box flexDirection="column" gap={1} flexShrink={0}>
        {plist.slice(0, 6).map(it => (
          <Box flexDirection="column" key={it.name} flexShrink={0}>
            <Box flexDirection="row" justifyContent="space-between">
              <Button key={it.name} plain onPress={() => void patch($, { project: project === it.name ? '' : it.name })}>
                {`${project === it.name ? '● ' : ''}${it.name}`}
              </Button>
              <Text bold>{fmtUsd(it.usd)}</Text>
            </Box>
            {draw && pic(barSvg(it.usd / ptop, w, pc.get(it.name) ?? '#898781', 'auto'), `${it.name}: ${fmtUsd(it.usd)}`, false)}
            <Text dimColor>{fmtTok(it.tok)} · {Math.round((it.usd / ptotal) * 100)}% {t('ofSpend')}</Text>
          </Box>
        ))}
        {plist.length > 6 && <Text dimColor>{t('moreA')}{plist.length - 6}{t('moreB')} · {fmtUsd(plist.slice(6).reduce((a, x) => a + x.usd, 0))}</Text>}
      </Box>
    )

    const block = (title: string, child: any) => (
      <Box flexDirection="column" flexShrink={0}>
        <Text dimColor>{title.toUpperCase()}</Text>
        {child}
      </Box>
    )
    const pic = (source: string, alt: string, interactive = true) => (
      <Box flexShrink={0}>
        <Svg source={source} alt={alt} isInteractive={interactive} {...size(source)} />
      </Box>
    )

    return (
      <Box flexDirection="column" gap={1} flexShrink={0}>
        <Box flexDirection="row" justifyContent="space-between">
          <Text bold>{t('title')}</Text>
          <Text dimColor>{t('updated')} {data.generated.slice(11, 16)}{v.busy ? ` · ${t('counting')}` : ''}</Text>
        </Box>
        {v.error !== '' && <Text color="red">{v.error}</Text>}
        <Box flexDirection="row" gap={1} flexWrap="wrap">
          {ORDER.map(p => (
            <Button key={p.id} hotkey={p.key} onPress={() => void patch($, { period: p.id })}>
              {`${p.id === period ? '● ' : ''}${PERIODS[p.id].label}`}
            </Button>
          ))}
        </Box>
        {project !== '' && (
          <Box flexDirection="row" gap={1} alignItems="center">
            <Text dimColor>{t('project')}</Text>
            <Button key="project-reset" onPress={() => void patch($, { project: '' })}>{`${project} ✕`}</Button>
          </Box>
        )}
        {draw && (
          <Box flexDirection="row" gap={1} alignItems="center" flexWrap="wrap">
            <Text dimColor>{t('day')}</Text>
            <Button key="day-prev" onPress={() => step(-1)}>‹</Button>
            <Select key="day-select" options={dayOptions} value={day} onSelect={(val: string) => void patch($, { day: val })} />
            <Button key="day-next" onPress={() => step(1)}>›</Button>
            <Button key="day-today" onPress={() => void patch($, { day: today })}>{t('today')}</Button>
            <Button key="day-all" onPress={() => void patch($, { day: '' })}>{t('wholePeriod')}</Button>
          </Box>
        )}
        {draw ? (
          <Box flexDirection="column" gap={1} flexShrink={0}>
            {pic(kpiSvg(rows, today, period, W, 'auto'), t('altTokens'))}
            {block(project ? `${t('activity')} · ${project}` : t('spendByDay'), pic(dailySvg(rows, today, period, W, 'auto', day), t('altDaily')))}
            {day !== '' && block(t('dayBreak'), pic(dayDetailSvg(rows, day, W, 'auto', pc), `${t('dayBreak')} ${day}`))}
            {wide ? (
              <Box flexDirection="row" gap={2} flexShrink={0}>
                <Box flexDirection="column" flexGrow={1}>{block(project ? t('modelsIn') : t('models'), pic(modelsSvg(rows, today, period, half, 'auto'), t('models')))}</Box>
                <Box flexDirection="column" flexGrow={1}>{block(t('projects'), projectList(half))}</Box>
              </Box>
            ) : (
              <Box flexDirection="column" gap={1} flexShrink={0}>
                {block(project ? t('modelsIn') : t('models'), pic(modelsSvg(rows, today, period, W, 'auto'), t('models')))}
                {block(t('projects'), projectList(W))}
              </Box>
            )}
            {block(project ? `${t('calendar')} · ${project}` : t('calendar'), pic(heatSvg(rows, project ? rows[0]?.[0] ?? first : first, today, W, 'auto', pc, day, project !== ''), t('altCal')))}
          </Box>
        ) : (
          <Box flexDirection="column" gap={1} flexShrink={0}>
            <Box flexDirection="column">
              {ORDER.map(p => {
                const r = inPeriod(rows, today, p.id)
                return <Text>{`${p.id === period ? '● ' : '○ '}${PERIODS[p.id].label}: ${fmtTok(sumTok(r))} · ${fmtUsd(sumUsd(r))}`}</Text>
              })}
            </Box>
            {block(t('projects'), projectList(W))}
          </Box>
        )}
        <Box flexDirection="row" justifyContent="space-between">
          <Text dimColor>{t('footA')} {first} · {turns} {t('footB')}</Text>
          <Button hotkey="r" onPress={() => void refresh($)}>{t('recalc')}</Button>
        </Box>
      </Box>
    )
  })
}
