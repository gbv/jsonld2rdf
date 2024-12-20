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

  it("default prefixes", async () => {
    const context = { id: "@id", title: "http://purl.org/dc/elements/1.1/title" }
    assert.equal(await jsonld2rdf("test/example.json", { context, prefixes: true }),
      `@prefix dc: <http://purl.org/dc/elements/1.1/> .

<my:id> dc:title "test" .
`)
  })


  it("convert object", async () => {
    const jsonld = { id: "x:1", title: "42" }
    assert.equal(await jsonld2rdf(jsonld, { context }),
      "<x:1> <http://example.org/title> \"42\" .\n")
  })

  it("convert array of objects", async () => {
    const jsonld = [
      { id: "x:1", title: "42" },
      { id: "x:2", title: "23" },
    ]
    assert.equal(await jsonld2rdf(jsonld, { context }),
      "<x:1> <http://example.org/title> \"42\" .\n"+
      "<x:2> <http://example.org/title> \"23\" .\n")
  })

})
