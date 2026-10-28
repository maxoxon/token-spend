# token-spend

A token-spend panel for Claude Code: how much you spent today, over 7 days, a month and all time; which models and projects used the most; and what it would cost at API prices.

- tiles: tokens and dollar equivalent for the period;
- spend-per-day chart, with a breakdown of any day by model and project;
- click a project and the charts and calendar recompute for it;
- a calendar coloured by project;
- `/tokens` opens the panel.

The panel speaks English or Russian, following Claude Code's `language` setting, then the system locale (English otherwise).

## Install

In Claude Code:

```
/plugin install token-spend --marketplace maxoxon/token-meter
```

From a shell:

```
claude plugin install token-spend --marketplace maxoxon/token-meter
```

In the Claude desktop app: "+" next to the prompt box → Plugins → Add marketplace → `maxoxon/token-meter` → Add plugin.

Needs `python3` on the PATH.

## Where the numbers come from

Everything is computed locally from the transcripts in `~/.claude/projects`; nothing is sent anywhere. The result is kept in `~/.claude/token-meter/stats.json`. The dollar figure is an estimate at public API prices (`prices.json`), not a bill: a subscription is not charged this way. History starts at the oldest transcript you still have.

A project is the folder a session was opened in (its first working directory), shown by that folder's name.

## What the mod runs and sends

- **Sends nothing.** The mod makes no network calls and no model calls. The only data it reads is your own transcripts (`~/.claude/projects`) and its own output file; the only data it writes is `~/.claude/token-meter/` (`stats.json`, `cache.pkl`).
- **Runs one program:** `python3 -I bin/aggregate.py` (the fixed command in `hooks/register.tsx`), when the panel opens, on `/tokens`, and on the "Recalculate" button. That script reads the transcripts and writes `stats.json`. On macOS it also calls `defaults read -g AppleLanguages` to pick the panel language; nothing else is started.
- **Hooks:** `session.start` loads the saved numbers, registers `/tokens` and opens the panel; `command.run` handles `/tokens` only (it opens the panel and returns a one-line text); `ui.render` draws the panel. No tool call, prompt or file is intercepted or changed.

## Check

```
claude plugin test .
claude plugin validate .
```
