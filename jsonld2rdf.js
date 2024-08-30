#!/usr/bin/env node

import fs from "fs"
import { program } from "commander"
import jsonld from "jsonld"
import { write } from "@jeswr/pretty-turtle"
import ParserN3 from "@rdfjs/parser-n3"
import { Readable } from "readable-stream"

import { createRequire } from "module"
const { name, description, version } = createRequire(import.meta.url)("./package.json")

const readJSON = file => {
  try {
    const input = file === "-" ? process.stdin.fd : file
    return JSON.parse(fs.readFileSync(input, "utf-8"))
  } catch(e) {
    console.error(e instanceof SyntaxError && file !== "-" ? `${file}: ${e.message}` : e.message)
    process.exit(1)
  }
}

program
  .name(name)
  .description(description)
  .argument("[file...]","JSON-LD input file")
  .option("-c, --context <file>", "JSON-LD context document")
  .option("-p, --prefixes <file>", "RDF Prefix map (as JSON object) for Turtle output")
  .option("-V, --version", "show the version number")
  .action(async (files, options) => {
    if (options.version) {
      console.log(`${name} ${version}`)
      return
    }

    if (!files.length) files = ["-"]
    const input = files.map(readJSON)

    if (options.context) {
      const context = readJSON(options.context)
      for (let data of input) {
        if (Array.isArray(data)) {
          data.forEach(item => (item["@context"] = context))
        } else {
          data["@context"] = context
        }
      }
    }

    const nt = (await Promise.all(input.map(
      data => jsonld.toRDF(data, {format: "application/n-quads"}),
    ))).join("\n")

    if (options.prefixes) {
      const prefixes = readJSON(options.prefixes) 
      const parserN3 = new ParserN3()
      const turtle = await (new Promise((resolve) => {
        const quads = []
        const output = parserN3.import(Readable.from(nt))
        output.on("data", quad => quads.push(quad))
          .on("end", async () => resolve(await write(quads, { prefixes })))
      }))
      process.stdout.write(turtle)
    } else {
      process.stdout.write(nt)
    }
  })

export default program
