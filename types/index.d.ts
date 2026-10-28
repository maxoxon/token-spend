/** [day, model, project, turns, in, out, cache_read, cache_5m, cache_1h, usd] — a row of bin/aggregate.py */
export type Row = [string, string, string, number, number, number, number, number, number, number]

export type Stats = {
  lang: string
  generated: string
  files: number
  turns: number
  unpriced: Record<string, number>
  rows: Row[]
}

export type Period = 'day' | 'week' | 'month' | 'all'

export type View = { period: Period; project: string; day: string; busy: boolean; error: string }

declare module 'claude-code' {
  interface PluginState {
    'token-spend': { stats: Stats | null; view: View }
  }
}
