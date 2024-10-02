import assert from "node:assert"
import { program } from "../jsonld2rdf.js"

async function run(args) {
  const stdout = []
  const write = process.stdout.write
  process.stdout.write = s => stdout.push(s)
  await program.parseAsync(["","",...args.split(" ")])
  process.stdout.write = write
  return stdout.join("")
}

describe("test CLI", () => {
  it("convert without context", async () =>
    assert.equal(await run("test/example.json"), ""))
  it("convert with context", async () =>
    assert.equal(await run("-c test/context.json test/example.json"), "<my:id> <http://purl.org/dc/terms/title> \"test\" .\n"))
  it("detect ndjson", async () =>
    assert.equal(await run("-c test/context.json test/example.ndjson"),
      `<x:1> <http://purl.org/dc/terms/title> "1" .
<x:2> <http://purl.org/dc/terms/title> "2" .
`))
  it("convert with prefixes", async () =>
    assert.equal(
      await run("-c test/context.json -p test/prefixes.json test/example.json"),
      `@prefix dct: <http://purl.org/dc/terms/> .

<my:id> dct:title "test" .
`))
  it("version", async () => 
    assert.match(await run("--version"), /^jsonld2rdf [0-9.]+\n$/))
})
