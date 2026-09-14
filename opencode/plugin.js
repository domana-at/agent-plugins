/**
 * Domana Brain plugin for opencode.
 *
 * Registers two things at startup:
 *   - the `domana` MCP server (https://mcp.domana.at/mcp), authenticated with
 *     `opencode mcp auth domana`
 *   - the `domana-brain` skill that ships in ./skills
 *
 * Both are additive. The hook runs on the already merged config, so anything
 * the user wrote themselves wins: `{"mcp": {"domana": {"enabled": false}}}`
 * turns the server off without removing the plugin.
 */
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))

export default async () => ({
  config: async (config) => {
    config.mcp ??= {}
    config.mcp.domana ??= {
      type: "remote",
      url: "https://mcp.domana.at/mcp",
      enabled: true,
    }

    config.skills ??= {}
    config.skills.paths ??= []
    const skills = path.join(here, "skills")
    if (!config.skills.paths.includes(skills)) config.skills.paths.push(skills)
  },
})
