#!/usr/bin/env node

import fs from "fs"
import { program } from "commander"
import jsonld from "jsonld"
import { write } from "@jeswr/pretty-turtle"
import ParserN3 from "@rdfjs/parser-n3"
import { Readable } from "readable-stream"

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
  .name("jsonld2rdf")
  .description("Convert JSON-LD to N-Triples or Turtle.")
  .argument("[file...]","JSON-LD input file")
  .option("-c, --context <file>", "JSON-LD context document")
  .option("-p, --prefixes <file>", "RDF Prefix map (as JSON object) for Turtle output")
  .action(async (files, options) => {
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
      const quads = []
      const parserN3 = new ParserN3()
      const output = parserN3.import(Readable.from(nt))
      output.on("data", quad => quads.push(quad))
        .on("end", async () => {
          process.stdout.write(await write(quads, { prefixes }))
        })
    } else {
      process.stdout.write(nt)
    }
  })

program.parse()    
