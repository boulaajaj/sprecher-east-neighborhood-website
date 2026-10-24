#!/usr/bin/env node
// Checks the intelligence/ folder (#337): the YAML files against their JSON Schemas, the pipeline's
// stage files, and that every field a prompt names (written `$.path`) exists in that stage's input
// or output schema. Run: node scripts/check-intelligence.mjs [folder]. Exits 1 with a list of problems.
//
// ajv and js-yaml are already installed with the site's dependencies (ajv through payload, pinned
// by the `overrides` in package.json; js-yaml through eslint). #343 declares them directly.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import yaml from 'js-yaml'

const dir = path.resolve(process.argv[2] ?? 'intelligence')
const problems = []
const problem = (file, message) =>
  problems.push(`${path.relative(process.cwd(), file)}: ${message}`)

// JSON_SCHEMA keeps dates such as 2026-10-24 as strings, as the schemas expect.
const readYaml = (file) => yaml.load(readFileSync(file, 'utf8'), { schema: yaml.JSON_SCHEMA })

const ajv = new Ajv2020({ allErrors: true, strict: true })
const schemaDir = path.join(dir, 'schemas')
const schemaFiles = readdirSync(schemaDir).filter((name) => name.endsWith('.schema.json'))
const idOf = {}
for (const name of schemaFiles) {
  const file = path.join(schemaDir, name)
  try {
    const schema = JSON.parse(readFileSync(file, 'utf8'))
    ajv.addSchema(schema)
    idOf[`schemas/${name}`] = schema.$id
  } catch (error) {
    problem(file, `not a valid schema: ${error.message}`)
  }
}
// A schema that doesn't compile (a broken $ref, a bad keyword) is reported once, then left out.
const compiled = {}
for (const [name, id] of Object.entries(idOf)) {
  try {
    compiled[name] = ajv.getSchema(id)
  } catch (error) {
    problem(path.join(dir, name), `does not compile: ${error.message}`)
  }
}
const schemaAt = (ref) => {
  try {
    return ajv.getSchema(ref)?.schema
  } catch {
    return undefined
  }
}

function validate(file, schemaName) {
  if (!existsSync(file)) return (problem(file, 'missing'), undefined)
  let data
  try {
    data = readYaml(file)
  } catch (error) {
    return (problem(file, `not valid YAML: ${error.message}`), undefined)
  }
  const check = compiled[schemaName]
  if (!check) return (problem(file, `schema ${schemaName} is missing or broken`), undefined)
  try {
    if (!check(data)) {
      for (const e of check.errors) problem(file, `${e.instancePath || '/'} ${e.message}`)
    }
  } catch (error) {
    // ajv compiles referenced schemas on first use, so a broken one can surface only here
    problem(file, `${schemaName} or a schema it references is broken: ${error.message}`)
  }
  return data
}

function duplicates(values) {
  return values.filter((value, index) => value != null && values.indexOf(value) !== index)
}

// 1. The data files
const sources = validate(path.join(dir, 'sources.yaml'), 'schemas/sources.schema.json')
if (sources?.sources) {
  const list = sources.sources
  for (const id of duplicates(list.map((s) => s.id)))
    problem(path.join(dir, 'sources.yaml'), `duplicate id ${id}`)
  for (const rank of duplicates(list.map((s) => s.pilotRank)))
    problem(path.join(dir, 'sources.yaml'), `two sources share pilotRank ${rank}`)
}
const evals = validate(path.join(dir, 'evals', 'cases.yaml'), 'schemas/eval-cases.schema.json')
for (const id of duplicates(evals?.cases?.map((c) => c.id) ?? []))
  problem(path.join(dir, 'evals', 'cases.yaml'), `duplicate case id ${id}`)
// The submit stage's routing (prompts/submit.md): which MCP tool each decision leads to
const ROUTE = {
  accept: 'submitSuggestion',
  'needs-review': 'reportItem',
  update: 'reportItem',
  cancel: 'reportItem',
  reject: 'none',
  duplicate: 'none',
}
const sourceIds = new Set(sources?.sources?.map((s) => s.id) ?? [])
const casesFile = path.join(dir, 'evals', 'cases.yaml')
for (const c of evals?.cases ?? []) {
  if (!sourceIds.has(c.input?.sourceId))
    problem(casesFile, `${c.id}: no source ${c.input?.sourceId}`)
  // duplicate, update and cancel name the known document; nothing else names one
  const known = ['duplicate', 'update', 'cancel'].includes(c.expected?.decision) ? c.known : null
  if (c.expected && (c.expected.targetId ?? null) !== (known?.id ?? null))
    problem(casesFile, `${c.id}: targetId must be ${known?.id ?? 'null'}`)
  if (c.expected && (c.expected.targetCollection ?? null) !== (known?.collection ?? null))
    problem(casesFile, `${c.id}: targetCollection must be ${known?.collection ?? 'null'}`)
  if (c.expected && ROUTE[c.expected.decision] !== c.expected.route)
    problem(casesFile, `${c.id}: ${c.expected.decision} routes to ${ROUTE[c.expected.decision]}`)
}
const pipeline = validate(path.join(dir, 'pipeline.yaml'), 'schemas/pipeline.schema.json')

// 2. Field paths: `$.a.b`, with `[]` stepping into an array's items
function lookup(schema, segments, baseId) {
  if (!schema || typeof schema !== 'object') return false
  if (schema.$ref) {
    const target = new URL(schema.$ref, baseId).href
    const resolved = schemaAt(target)
    return lookup(resolved, segments, target.split('#')[0])
  }
  for (const key of ['anyOf', 'oneOf', 'allOf']) {
    if (schema[key]?.some((branch) => lookup(branch, segments, baseId))) return true
  }
  if (segments.length === 0) return true
  const [head, ...rest] = segments
  const isArray = head.endsWith('[]')
  const next = schema.properties?.[isArray ? head.slice(0, -2) : head]
  if (!next) return false
  return isArray ? items(next, rest, baseId) : lookup(next, rest, baseId)
}
function items(schema, rest, baseId) {
  if (schema.$ref) {
    const target = new URL(schema.$ref, baseId).href
    return items(schemaAt(target) ?? {}, rest, target.split('#')[0])
  }
  if (schema.items) return lookup(schema.items, rest, baseId)
  return ['anyOf', 'oneOf'].some((key) =>
    schema[key]?.some((branch) => items(branch, rest, baseId)),
  )
}

// 3. Stages and their prompts
for (const stage of pipeline?.stages ?? []) {
  const file = path.join(dir, stage.prompt)
  if (!existsSync(file)) {
    problem(file, `missing (stage ${stage.id})`)
    continue
  }
  const text = readFileSync(file, 'utf8')
  const front = /^---\n([\s\S]*?)\n---\n/.exec(text)
  const meta = front ? yaml.load(front[1], { schema: yaml.JSON_SCHEMA }) : {}
  if (meta?.stage !== stage.id || meta?.input !== stage.input || meta?.output !== stage.output) {
    problem(
      file,
      `front matter must say stage: ${stage.id}, input: ${stage.input}, output: ${stage.output}`,
    )
  }
  for (const section of ['Untrusted content', 'Unknowns']) {
    if (!new RegExp(`^## ${section}$`, 'm').test(text))
      problem(file, `needs a "## ${section}" section`)
  }
  const schemas = [stage.input, stage.output].map((name) => compiled[name] && idOf[name])
  if (schemas.includes(undefined)) {
    problem(file, `input or output schema is not in schemas/`)
    continue
  }
  const paths = [...text.matchAll(/`\$\.([A-Za-z0-9_.[\]]+)`/g)].map((m) => m[1])
  if (paths.length === 0) problem(file, 'names no fields (`$.field`)')
  for (const fieldPath of new Set(paths)) {
    const segments = fieldPath.split('.')
    if (!schemas.some((id) => lookup(schemaAt(id), segments, id))) {
      problem(file, `\`$.${fieldPath}\` is not a field of ${stage.input} or ${stage.output}`)
    }
  }
}

if (problems.length) {
  console.error(`intelligence/ check failed:\n- ${problems.join('\n- ')}`)
  process.exit(1)
}
console.log(
  `intelligence/ check passed: ${sources.sources.length} sources, ${evals.cases.length} eval cases, ` +
    `${pipeline.stages.length} stages, ${schemaFiles.length} schemas.`,
)
