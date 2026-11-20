# Domana agent plugins

Plugins that connect Claude Code, Codex and opencode to Domana Brain.

- `claude/`: Claude Code plugin: the `domana` MCP server (`.mcp.json`,
  `https://mcp.domana.at/mcp`) and the `domana-brain` skill.
- `codex/`: Codex plugin: the `domana-brain` skill. The MCP server is
  registered separately with `codex mcp add domana --url https://mcp.domana.at/mcp`
  so the entry has exactly one owner.
- `opencode/`: opencode 2 plugin: a module whose `setup` registers both the
  MCP server and the skill through opencode's transforms. opencode has no
  plugin marketplace; it installs npm/git packages, so the repository root
  doubles as the package (`domana-opencode`, entry point `opencode/index.js`).
  The opencode 1.x plugin lives on under the `v1` tag.

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

opencode 2:

```
opencode plugin add github:domana-at/agent-plugins
opencode mcp auth domana
```

The first command installs the package and adds it to `plugins` in your
global `opencode.json(c)`. If the server or the skill does not show up, run
`opencode service restart`. Check what arrived with
`opencode api GET /api/mcp` (the `domana` server; `needs_auth` until you
sign in) and `opencode api GET /api/skill` (`domana-brain`). `opencode mcp list`
shows only servers from config files, not the one the plugin adds.

What you configure yourself wins over what the plugin adds. To keep the plugin
but turn the server off, define it with `disabled`:

```json
{
  "mcp": {
    "servers": {
      "domana": { "type": "remote", "url": "https://mcp.domana.at/mcp", "disabled": true }
    }
  }
}
```

To turn the whole plugin off, add `"-domana"` to `plugins`.

opencode 1.17 to 1.19 cannot run opencode 2 plugins. Install the `v1` tag
there:

```
opencode plugin -g domana-opencode@github:domana-at/agent-plugins#v1
opencode mcp auth domana
```

## Skill source

`app/skills/domana-brain` in the Domana app repository is the single source;
`scripts/sync-skill.sh` copies it into all three plugins. Do not edit the copies.
