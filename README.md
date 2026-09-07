# Domana agent plugins

Plugins that connect Claude Code and Codex to Domana Brain.

- `claude/` — Claude Code plugin: the `domana` MCP server (`.mcp.json`,
  `https://mcp.domana.at/mcp`) and the `domana-brain` skill.
- `codex/` — Codex plugin: the `domana-brain` skill. The MCP server is
  registered separately with `codex mcp add domana --url https://mcp.domana.at/mcp`
  so the entry has exactly one owner.

## Install

Claude Code:

```
claude plugin marketplace add domana-at/agent-plugins
claude plugin install -s user domana@domana-agents
```

then run `/mcp` in a session once to sign in with your Domana account.

Codex:

```
codex mcp add domana --url https://mcp.domana.at/mcp
codex mcp login domana
codex plugin marketplace add domana-at/agent-plugins
codex plugin add domana@domana-agents
```

## Skill source

`app/skills/domana-brain` in the Domana app repository is the single source;
`scripts/sync-skill.sh` copies it into both plugins. Do not edit the copies.
