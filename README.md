# Domana agent plugins

Plugins that connect Claude Code, Codex and opencode to Domana Brain.

- `claude/` — Claude Code plugin: the `domana` MCP server (`.mcp.json`,
  `https://mcp.domana.at/mcp`) and the `domana-brain` skill.
- `codex/` — Codex plugin: the `domana-brain` skill. The MCP server is
  registered separately with `codex mcp add domana --url https://mcp.domana.at/mcp`
  so the entry has exactly one owner.
- `opencode/` — opencode plugin: a JS module whose `config` hook registers both
  the MCP server and the skill. opencode has no plugin marketplace; it installs
  npm/git packages, so the repository root doubles as the package
  (`domana-opencode`, entry point `opencode/plugin.js`).

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

opencode (needs opencode 1.17 or newer, which is where skill folders can be
registered from config):

```
opencode plugin -g domana-opencode@github:domana-at/agent-plugins
opencode mcp auth domana
```

The first command installs the package and writes the entry into
`~/.config/opencode/opencode.json`; drop `-g` to install it for the current
project only. Config is read once at startup, so restart opencode after
installing. To turn the server off without removing the plugin, set it in your
own config — user config wins over what the plugin adds:

```json
{ "mcp": { "domana": { "enabled": false } } }
```

Check what arrived with `opencode mcp list` and `opencode debug skill`.

## Skill source

`app/skills/domana-brain` in the Domana app repository is the single source;
`scripts/sync-skill.sh` copies it into all three plugins. Do not edit the copies.
