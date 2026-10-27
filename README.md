# token-meter

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
/plugin install token-meter --marketplace maxoxon/token-meter
```

From a shell:

```
claude plugin install token-meter --marketplace maxoxon/token-meter
```

In the Claude desktop app: "+" next to the prompt box → Plugins → Add marketplace → `maxoxon/token-meter` → Add plugin.

Needs `python3` on the PATH.

## Where the numbers come from

Everything is computed locally from the transcripts in `~/.claude/projects`; nothing is sent anywhere. The result is kept in `~/.claude/token-meter/stats.json`. The dollar figure is an estimate at public API prices (`prices.json`), not a bill: a subscription is not charged this way. History starts at the oldest transcript you still have.

A project is the first folder of the path under your home directory. `Desktop/`, `Documents/`, `Downloads/`, `Movies/` and `Music/` are skipped, so the folder inside becomes the project. To add your own container folders, create `~/.claude/token-meter/folders.json`, e.g. `["Work/clients/"]`.

## Check

```
claude plugin test .
claude plugin validate .
```
