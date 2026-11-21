# Domana Brain for Claude Code

Connects Claude Code to your Domana Brain, the knowledge base for your notes,
decisions, tasks and team spaces. Claude can search what you already wrote,
read notes, follow the links between them, and save new notes and tasks when
you ask.

## What the plugin contains

- One remote MCP server, `domana`, at `https://mcp.domana.at/mcp`. You sign
  in with your Domana account in the browser (OAuth); a new account is
  created there if you have none.
- One skill, `domana-brain`, that tells Claude when the vault is the right
  source and how to file new knowledge.

It ships no hooks and no scripts and runs nothing on your machine. Data leaves
your machine only through the MCP tool calls Claude makes to
`mcp.domana.at`: the search terms and note text of each call. Tool results
are notes of your own account and the team spaces you belong to.

## Install

```
/plugin marketplace add domana-at/agent-plugins
/plugin install domana@domana-agents
```

Then run `/mcp` and sign in to `domana`.

## Privacy and support

Privacy policy: https://www.domana.at/datenschutz. Support: support@domana.at.
License: MIT.
