// Run with `npm test`. A fake ctx stands in for opencode 2's plugin context.
import assert from "node:assert/strict"
import test from "node:test"
import plugin from "./index.js"

function fakeCtx({ servers = {}, skills = {} } = {}) {
  const editor = (store) => ({
    get: (id) => store[id],
    set: (id, value) => { store[id] = value },
    add: (value) => { store[value.id] = value },
  })
  return {
    servers,
    skills,
    mcp: { transform: async (fn) => fn(editor(servers)) },
    skill: { transform: async (fn) => fn(editor(skills)) },
  }
}

test("registers the server and the skill", async () => {
  const ctx = fakeCtx()
  await plugin.setup(ctx)
  assert.deepEqual(ctx.servers.domana, { type: "remote", url: "https://mcp.domana.at/mcp" })
  const skill = ctx.skills["domana-brain"]
  assert.match(skill.description, /^Read and extend the user's Domana Brain/)
  assert.match(skill.content, /^# Domana Brain/)
  assert.doesNotMatch(skill.content, /^---/)
  assert.ok(skill.path.endsWith("skills/domana-brain/SKILL.md"))
})

test("what the user configured wins", async () => {
  const own = { type: "remote", url: "https://example.test/mcp", disabled: true }
  const ctx = fakeCtx({ servers: { domana: own }, skills: { "domana-brain": { id: "domana-brain" } } })
  await plugin.setup(ctx)
  assert.equal(ctx.servers.domana, own)
  assert.deepEqual(ctx.skills["domana-brain"], { id: "domana-brain" })
})
