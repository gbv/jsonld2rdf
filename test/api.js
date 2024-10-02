import assert from "node:assert"
import { jsonld2rdf } from "../jsonld2rdf.js"

describe("test API", () => {
  it("convert without context", async () =>
    assert.equal(await jsonld2rdf(["test/example.json"]), ""))

  const context = { id: "@id", title: "http://example.org/title" }
  it("convert with context", async () =>
    assert.equal(await jsonld2rdf(["test/example.json"], { context}),
      "<my:id> <http://example.org/title> \"test\" .\n"))
  
  const prefixes = { ex: "http://example.org/" }
  it("convert with prefixes", async () =>
    assert.equal(await jsonld2rdf("test/example.json", { context, prefixes }),
      `@prefix ex: <http://example.org/> .

<my:id> ex:title "test" .
`))
})
