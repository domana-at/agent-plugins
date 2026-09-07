# domana-brain (skill)

Official Domana agent skill. It lets a coding agent (Claude Code, Codex, …) read the
user's personal Domana Brain and add new knowledge to it. The brain is a folder of
plain Markdown files on the user's machine, kept in sync by the Domana desktop app —
so the skill is instructions plus conventions, not a client library.

Status: **preview**. Personal, local scope only.

## Install (Claude Code)

Copy the folder into a skills directory:

```bash
# per project
mkdir -p .claude/skills && cp -R skills/domana-brain .claude/skills/

# or for every project on this machine
mkdir -p ~/.claude/skills && cp -R skills/domana-brain ~/.claude/skills/
```

Then tell the agent where the vault is, once:

```bash
export DOMANA_VAULT="/path/to/your/vault"   # the folder bound in Domana's "Local files" storage dialog
```

Other agents: point them at `SKILL.md`, or paste its contents into their instruction
file. It has no dependency on Domana's source tree.

## Limitations

- **Personal notes only.** Team spaces exist solely in Domana's cloud and are never
  mirrored to disk. Team access is planned as an MCP server, not part of this skill.
- **Local search is keyword search.** The knowledge graph and semantic search are
  cloud-side; there is no local semantic index.
- **Requires a bound vault folder.** Binding one is opt-in in the app. Without it,
  nothing of the personal brain exists on disk and the skill has nothing to read.
- **Markdown only.** PDFs and other imports keep their original binary in the vault;
  their extracted text lives only in the cloud.
- **No lock on concurrent edits.** The app and an external agent writing the same file
  within the same sync window is last-write-wins.
