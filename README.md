# jsonld2rdf

> Convert JSON-LD to N-Triples or Turtle

[![Test](https://github.com/gbv/jsonld2rdf/actions/workflows/test.yml/badge.svg)](https://github.com/gbv/jsonld2rdf/actions/workflows/test.yml)
[![NPM Version](http://img.shields.io/npm/v/jsonld2rdf.svg?style=flat)](https://www.npmjs.org/package/jsonld2rdf)

This package provides a command line client to convert JSON-LD files into N-Triples or Turtle syntax.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
  - [Command line interface](#command-line-interface)
  - [API](#api)
- [See Also](#see-also)

## Install

~~~sh
npm install -g jsonld2rdf
~~~

## Usage

### Command line interface

~~~sh
Usage: jsonld2rdf [options] [file...]

Convert JSON-LD to N-Triples or Turtle.

Arguments:
  file                   JSON-LD input file

Options:
  -c, --context <file>   JSON-LD context document
  -p, --prefixes [file]  RDF Prefix map (JSON object file) for Turtle output
  -n, --ndjson           input is newline delimited JSON
  -h, --help             display help for command
~~~

Reads from standard input by default or when file name is `-`. Input can be
a JSON object, an array of JSON objects or newline-delimited JSON. Each JSON
object ist converted. Option `context` overrides an possibly existing field
`@context`.

For example this JSON file `example.json`

~~~json
{
  "id": "my:id",
  "title": "test"
}
~~~

with this context document `context.json`

~~~json
{
  "title": "http://purl.org/dc/terms/title",
  "id": "@id"
}
~~~

converted with `jsonld2rdf -c context.json example.json` to

~~~ttl
<my:id> <http://purl.org/dc/terms/title> "test" .
~~~

With an additional prefixes file `prefixes.json`

~~~
{
  "dct": "http://purl.org/dc/terms/"
}
~~~

it is converted with `jsonld2rdf -c context.json -p prefixes.json example.json` to

~~~ttl
@prefix dct: <http://purl.org/dc/terms/> .

<my:id> dct:title "test" .
~~~

The prefix file can be omitted to use the [list of common prefixes](https://github.com/gbv/jsonld2rdf/blob/main/jsonld2rdf.js):

~~~sh
jsonld2rdf -c context.json example.json -p
~~~

### API

Function `jsonld2rdf` expects an object, a file name, or an array of file names
and/or objects to transform. File name `-` can be used for standard input and
files ending with `.ndjson` or `.jsonl` are read as newline delimited JSON. The
second argument is a options object with optional fields `context` (object) and
`prefixes` (object or special value `true`). Additional option field `ndjson`
can be used to enforce reading input files as newline delimited JSON instead of
plain JSON. The function returns a Turtle string if `prefixes` have been given
or N-Triples otherwise.

~~~js
import { jsonld2rdf } from "jsonld2rdf"

const context = {
  id: "@id",
  title: "http://purl.org/dc/terms/title",
}

const prefixes = {
  dct: "http://purl.org/dc/terms/"
}

var nt  = jsonld2rdf(["file.json"], { context })
var ttl = jsonld2rdf(["file.json"], { context, prefixes })

// just use common namespace prefixes
var ttl = jsonld2rdf(["file.json"], { context, prefixes: true })
~~~

## See Also

Implementation is based on package [@digitalcredentials/jsonld](https://www.npmjs.com/package/@digitalcredentials/jsonld). Depending on your use case you may better directly use it.

Similar packages include [jsonld-cli](https://www.npmjs.com/package/jsonld-cli) and [ndjsonld](https://www.npmjs.com/package/ndjsonld]).

