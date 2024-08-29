# jsonld2rdf

> Convert JSON-LD to N-Triples or Turtle

[![Test](https://github.com/gbv/jsonld2rdf/actions/workflows/test.yml/badge.svg)](https://github.com/gbv/jsonld2rdf/actions/workflows/test.yml)
[![NPM Version](http://img.shields.io/npm/v/jsonld2rdf.svg?style=flat)](https://www.npmjs.org/package/jsonld2rdf)

This package provides a command lineparsers and serializers to convert between labeled property graph formats and databases.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [See Also](#see-also)

## Install

~~~sh
npm install -g jsonld2rdf
~~~

## Usage

~~~sh
Usage: jsonld2rdf [options] [file...]

Convert JSON-LD to N-Triples or Turtle.

Arguments:
  file                   JSON-LD input file

Options:
  -c, --context <file>   JSON-LD context document
  -p, --prefixes <file>  RDF Prefix map (as JSON object) for Turtle output
  -h, --help             display help for command
~~~

## See Also

Implementation is based on package [@digitalcredentials/jsonld](https://www.npmjs.com/package/@digitalcredentials/jsonld). Similar packages include [jsonld-cli](https://www.npmjs.com/package/jsonld-cli) and [ndjsonld](https://www.npmjs.com/package/ndjsonld]).

