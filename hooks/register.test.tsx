import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'token-spend',
  component: 'Pane',
  requestId: 'token-spend',
  props: {
    title: 'Token spend',
    isFocused: false,
    bodyColumns: 52,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

const pad2 = (n: number) => String(n).padStart(2, '0')
const now = new Date()
const today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`

// Invented rows: today's (1.00 billion tokens, $12.5) and an ancient one (2 million, $3).
const stats = (lang: string) => ({
  lang,
  generated: '2026-10-27T20:10:50+01:00',
  files: 2,
  turns: 30,
  unpriced: {},
  rows: [
    [today, 'claude-sonnet-5-5', 'my-app', 20, 100, 200, 1_000_000_000, 0, 0, 12.5],
    [today, 'claude-opus-5-5', 'zz-proj', 5, 10, 10, 1_000, 0, 0, 4.0],
    ['2020-01-01', 'claude-opus-5', 'old-proj', 10, 1, 1, 2_000_000, 0, 0, 3.0],
  ],
})

for (const [lang, tokens, breakdown] of [['en', 'Tokens', 'Day breakdown'], ['ru', 'Токены', 'Разбор дня']]) test(`panel counts periods and filters lists by period (${lang})`, async ($, on) => {
  on('command.register', () => ({ value: { command: 'tokens' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('fs.read', () => ({ value: JSON.stringify(stats(lang)) }))
  on('process.run', () => ({ value: { exitCode: 0, stdout: '', stderr: '' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  const sources = async () => (await ui.findAll({ type: 'Svg' })).map((s: any) => String(s.props?.source ?? s.source))
  const all = async () => (await sources()).join('\n')

  // default is 7 days, no project chosen: tiles, days, models, calendar and a bar per project
  const week = await all()
  expect(week).toContain('$17')
  expect(week).toContain(tokens)
  // the 2020 project is outside the period (filter control)
  expect(await ui.find({ type: 'Button', text: /my-app/ })).toBeTruthy()
  expect(await ui.find({ type: 'Button', text: /zz-proj/ })).toBeTruthy()
  expect(await ui.find({ type: 'Button', text: /old-proj/ })).toBeFalsy()
  expect(week).not.toContain(breakdown)

  // entering a project: tiles recount for it alone, a reset chip appears
  await ui.press({ key: 'my-app' })
  const one = await all()
  expect(one).toContain('$13')
  expect(one).not.toContain('$17')
  expect(await ui.find({ key: 'project-reset' })).toBeTruthy()

  // picking a day opens the day breakdown
  await ui.select({ key: 'day-select', value: today })
  expect(await all()).toContain(breakdown)

  // resetting the project brings back the overall numbers
  await ui.press({ key: 'project-reset' })
  expect(await all()).toContain('$17')
  await ui.unmount()
})
