// Content gate: no em dashes (U+2014) and no en dashes (U+2013) in tracked text.
//
// Typographically the stroke is correct German. As a signal it now reads as
// machine-written, and Domana sells an AI product, so its own copy must not
// look like AI output. The rule and its reasoning live in
// wiki/Design/design-system.md section 10 and wiki/Agent/working-agreements.md.
//
// Two things are deliberately NOT violations, because there the stroke carries
// meaning rather than prose rhythm:
//   - a range between numbers or weekday abbreviations (10-20, Mo-Fr)
//   - a stroke that IS the whole value: the placeholder for an empty cell
// Anything else is a finding: replace the stroke with a colon, comma, full
// stop or parentheses, whichever the sentence actually needs.
//
// Runs over `git ls-files` so it never follows symlinks into SwiftPM
// checkouts or descends into ignored build output.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const EM = '—' // dash-ok: the literal character this gate detects, not prose
const EN = '–' // dash-ok: the literal character this gate detects, not prose
const DASH = new RegExp(`[${EM}${EN}]`)

// Paths the gate does not own. Keep each entry justified: a skip nobody can
// explain is a hole, not a rule.
const SKIP = [
  /(^|\/)node_modules\//,
  /(^|\/)(dist|build|target|out)\//,
  /(^|\/)supabase\/migrations\//,      // applied migrations are never re-edited
  /(^|\/)site\/demo\//,                // build output of ../app, regenerated
  /(^|\/)site\/vendor\//,              // vendored third-party bundles
  /(^|\/)site\/_ds\//,                 // Claude Design export, not ours to edit
  /(^|\/)design\//,                    // ios_app: Claude Design export
  /(^|\/)support\.js$/,                // Design System runtime, vendored
  /(^|\/)fixtures\//,                  // byte-compared against generated output
  /(^|\/)comparison\//,                // recorded model answers, quoted not authored
  /-lock\.(json|yaml)$/,
  /\.(png|jpe?g|gif|webp|svg|ico|pdf|zip|gz|woff2?|ttf|otf|mp4|mov|keystore|jks)$/i,
]

// Extensions worth reading. Everything else is either binary or not text we
// author. Listing them beats sniffing: a new file type should be a decision.
const TEXT = /\.(ts|tsx|js|jsx|mjs|cjs|swift|kt|kts|rs|sql|md|html|css|scss|xml|json|yml|yaml|txt|sh|toml|strings|tex|py)$/i

const ALLOWED = [
  // Range: stroke sits between digits or weekday abbreviations.
  new RegExp(`(?<=\\d)\\s?[${EM}${EN}]\\s?(?=\\d)`),
  new RegExp(`(?<=\\b(Mo|Di|Mi|Do|Fr|Sa|So|Mon|Tue|Wed|Thu|Fri|Sat|Sun))\\s?[${EM}${EN}]\\s?(?=\\b)`),
  // Graph triplet arrow: «source» -relation-> «target». The stroke is the
  // arrow's tail, not a dash. Backend, app, iOS and Android all assert on
  // this shape, so changing it would break the format across four repos.
  new RegExp(`[${EM}${EN}][^${EM}${EN}→]{0,40}→`),
]

// Escape hatch for the handful of places where the stroke is data we must
// keep reading: the requirements-heading parsers accept `[EM EN -]` because
// users already have such files in their vault. Put `dash-ok` in a comment on
// the line and say why. Grep for it before adding one; if the list grows past
// a handful, the rule is wrong, not the code.
const INLINE_ALLOW = /dash-ok/

// Whole-file escape hatch for test fixtures whose subject IS the stroke: the
// requirements parsers are fed sample documents inside raw-string blocks,
// where a line comment would become part of the data. Put `dash-ok-file` in
// the file's header comment, with the reason.
const FILE_ALLOW = /dash-ok-file/

// The stroke standing alone as a value: '-', "-", `-`, >-<, | - |.
// The table-cell arm uses a lookahead for the closing pipe so that adjacent
// empty cells (`| - | - |`) both match: consuming it would eat the separator
// the next cell needs to start.
const PLACEHOLDER = new RegExp(
  `(['"\`]\\s*[${EM}${EN}]\\s*['"\`])|(>\\s*[${EM}${EN}]\\s*<)|(\\|\\s*[${EM}${EN}]\\s*(?=\\|))`,
  'g',
)

// A line holding nothing but the stroke is a placeholder too: JSX and
// Markdown both put an empty-value glyph on its own line, where the quotes
// or pipes PLACEHOLDER looks for never appear.
const LONE = new RegExp(`^\\s*[${EM}${EN}]\\s*$`)

function strip(line) {
  if (LONE.test(line)) return ''
  // Remove every occurrence the rule permits, then see what is left.
  let rest = line.replace(PLACEHOLDER, '')
  for (const re of ALLOWED) {
    const global = new RegExp(re.source, 'g')
    rest = rest.replace(global, '')
  }
  return rest
}

// `node scripts/check-dashes.mjs --selftest` checks the one piece of logic
// that can silently go wrong: which strokes count as violations.
if (process.argv.includes('--selftest')) {
  const violates = (line) => !INLINE_ALLOW.test(line) && DASH.test(strip(line))
  const cases = [
    // [line, should this be reported?]
    [`Alle Plugins optional ${EM} Sie entscheiden.`, true],
    [`Danke ${EM} Sie stehen auf der Liste.`, true],
    [`- \`site/\` ${EM} LIVE site`, true],
    [`## FR-APP-001 ${EM} Login works`, true],
    [`Seiten 10${EN}20 im Anhang`, false],
    [`Mo${EN}Fr von 9 bis 17 Uhr`, false],
    [`const empty = '${EM}'`, false],
    [`<td>${EM}</td>`, false],
    [`| Name | ${EM} | 3 |`, false],
    // Adjacent empty cells: the separator pipe is shared, so a consuming
    // match would report the second one.
    [`| Name | ${EM} | ${EM} |`, false],
    [`| A | ${EM} | ${EM} | ${EM} |`, false],
    [`value={total === 0 ? "${EM}" : pct}`, false],
    // A JSX or Markdown line holding only the glyph is a placeholder.
    [`        ${EM}`, false],
    [`  ${EN}  `, false],
    [`Bereich 10${EN}20 und ein Einschub ${EM} der stört.`, true],
    ['Nothing to see here.', false],
    // Graph triplet arrow stays: it is the format, not a dash.
    [`"«source» ${EM}relation→ «target»"`, false],
    [`«Team Alpha» ${EM}betreut→ «Projekt Beta»`, false],
    [`Halle 3 ${EM} leitet → Meier`, false],
    // Inline escape hatch.
    [`const RE = /[${EM}${EN}-]/ // dash-ok: reads existing vault files`, false],
    [`Ein Satz ${EM} ohne Marker bleibt ein Fund.`, true],
  ]
  let failed = 0
  for (const [line, expected] of cases) {
    const actual = violates(line)
    if (actual !== expected) {
      console.error(`FAIL expected=${expected} got=${actual}: ${line}`)
      failed += 1
    }
  }
  console.log(failed === 0 ? `selftest: ${cases.length} cases ok` : `selftest: ${failed} failed`)
  process.exit(failed === 0 ? 0 : 1)
}

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  .split('\0')
  .filter((f) => f && TEXT.test(f) && !SKIP.some((re) => re.test(f)))

const findings = []
for (const file of files) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue // deleted between ls-files and read, or unreadable: not our problem
  }
  if (!DASH.test(text)) continue
  if (FILE_ALLOW.test(text)) continue
  text.split('\n').forEach((line, i) => {
    if (!DASH.test(line)) return
    if (INLINE_ALLOW.test(line)) return
    if (!DASH.test(strip(line))) return
    findings.push({ file, line: i + 1, text: line.trim() })
  })
}

if (findings.length === 0) {
  console.log(`check-dashes: clean (${files.length} files)`)
  process.exit(0)
}

console.error(`check-dashes: ${findings.length} dash(es) in text that ships or is read.\n`)
for (const f of findings.slice(0, 50)) {
  console.error(`  ${f.file}:${f.line}`)
  console.error(`    ${f.text.length > 120 ? `${f.text.slice(0, 120)}...` : f.text}`)
}
if (findings.length > 50) console.error(`\n  ... and ${findings.length - 50} more.`)
console.error(`
Replace the stroke with what the sentence needs: a colon before an
explanation, a comma for an aside, a full stop between two standalone
statements, parentheses for an afterthought.
Ranges (10-20) and the standalone empty-value placeholder are allowed.
Rule: wiki/Design/design-system.md section 10.`)
process.exit(1)
