import { readFileSync } from "fs"
import { program } from "commander"
import jsonld from "jsonld"
import { write } from "@jeswr/pretty-turtle"
import ParserN3 from "@rdfjs/parser-n3"
import { Readable } from "readable-stream"

import { createRequire } from "module"
const { name, description, version } = createRequire(import.meta.url)("./package.json")

// Avoid EAGAIN: resource temporarily unavailable, read
const { stdin } = process
const readStdin = async () => {
  if (stdin.isTTY) return ""
  const result = []
  let length = 0
  for await (const chunk of stdin) {
    result.push(chunk)
    length += chunk.length
  }
  return Buffer.concat(result, length).toString()
}

const readJSON = async (file, ndjson) => {
  try {
    const input = file === "-" ?await readStdin() : readFileSync(file, "utf-8")
    if (ndjson || file.endsWith(".ndjson") || file.endsWith(".jsonl")) {
      return input.split("\n").filter(line => line !== "").map((line, i) => {
        try { return JSON.parse(line) }
        catch(e) { throw new SyntaxError(`line ${i}: ${e.message}`) }
      })
    } else {
      return JSON.parse(input)
    }
  } catch(e) {
    throw (e instanceof SyntaxError && file !== "-") ?
      new SyntaxError(`${file}: ${e.message}`) : e
  }
}

async function readInputs(files, ndjson) {
  if (!Array.isArray(files)) files = [files]
  if (!files.length) files = ["-"]
  return Promise.all(files.map(file => typeof file === "string" ? readJSON(file, ndjson) : file))
}

async function jsonld2rdf(files, { context, prefixes, ndjson } = {}) {
  const inputs = await readInputs(files, ndjson)

  if (context) {
    for (let data of inputs) {
      if (Array.isArray(data)) {
        data.forEach(item => (item["@context"] = context))
      } else {
        data["@context"] = context
      }
    }
  }

  const nt = (await Promise.all(inputs.map(
    data => jsonld.toRDF(data, {format: "application/n-quads"}),
  ))).join("")

  if (prefixes) {
    const parserN3 = new ParserN3()
    const turtle = await (new Promise((resolve) => {
      const quads = []
      const output = parserN3.import(Readable.from(nt))
      output.on("data", quad => quads.push(quad))
        .on("end", async () => resolve(await write(quads, { prefixes })))
    }))
    return turtle
  } else {
    return nt
  }
}

program
  .name(name)
  .description(description)
  .argument("[file...]","JSON-LD input file")
  .option("-c, --context <file>", "JSON-LD context document")
  .option("-p, --prefixes <file>", "RDF Prefix map (as JSON object) for Turtle output")
  .option("-n, --ndjson", "Input is newline delimited JSON")
  .option("-V, --version", "show the version number")
  .action(async (files, options) => {
    if (options.version) {
      console.log(`${name} ${version}`)
      return
    }

    if (stdin.isTTY && !files.length) {
      program.help()
      return
    }

    try {
      var { context, prefixes, ndjson } = options
      if (context) {
        context = await readJSON(context)
      }
      if (prefixes) {
        prefixes = await readJSON(prefixes)
      }
      process.stdout.write(await jsonld2rdf(files, { context, prefixes, ndjson }))
    } catch(e) {
      console.error(e.message)
      process.exit(1)
    }
  })

export { program, jsonld2rdf }
