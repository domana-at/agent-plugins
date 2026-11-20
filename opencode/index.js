/**
 * Domana Brain plugin for opencode 2.
 *
 * Registers two things at startup:
 *   - the `domana` MCP server (https://mcp.domana.at/mcp), authenticated with
 *     `opencode mcp auth domana`
 *   - the `domana-brain` skill that ships in ./skills
 *
 * Both are additive: a `domana` server or a `domana-brain` skill the user
 * configured themselves wins. opencode 1.x runs only V1 plugins; it installs
 * the `v1` tag of this repository instead (see README).
 */
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const skillPath = path.join(here, "skills", "domana-brain", "SKILL.md")

/** Split SKILL.md into the frontmatter description and the body opencode shows the model. */
function parseSkill(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text)
  if (!match) return { description: undefined, content: text }
  const description = /^description:\s*(.*)$/m.exec(match[1])?.[1].trim()
  return { description, content: match[2].trimStart() }
}

// ponytail: a plain definition instead of Plugin.define from @opencode/plugin.
// define is the identity function (checked in 2.3.2), so the package needs no
// dependency and installs straight from git. Import it if define ever gains
// behaviour.
export default {
  id: "domana",
  async setup(ctx) {
    await ctx.mcp.transform((editor) => {
      if (!editor.get("domana")) {
        editor.set("domana", { type: "remote", url: "https://mcp.domana.at/mcp" })
      }
    })

    // Transform callbacks are synchronous: read the file before registering.
    const { description, content } = parseSkill(await readFile(skillPath, "utf8"))
    await ctx.skill.transform((editor) => {
      if (!editor.get("domana-brain")) {
        editor.add({ id: "domana-brain", name: "domana-brain", description, path: skillPath, content })
      }
    })
  },
}
