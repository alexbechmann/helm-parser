# Helm Parser

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![code style: prettier](https://camo.githubusercontent.com/92e9f7b1209bab9e3e9cd8cdf62f072a624da461/68747470733a2f2f666c61742e62616467656e2e6e65742f62616467652f4275696c74253230576974682f547970655363726970742f626c7565)](https://github.com/microsoft/TypeScript) ![CI](https://github.com/alexbechmann/helm-parser/actions/workflows/main.yml/badge.svg?branch=master)

```
_   _      _             ____
| | | | ___| |_ __ ___   |  _ \ __ _ _ __ ___  ___ _ __
| |_| |/ _ \ | '_ ` _ \  | |_) / _` | '__/ __|/ _ \ '__|
|  _  |  __/ | | | | | | |  __/ (_| | |  \__ \  __/ |
|_| |_|\___|_|_| |_| |_| |_|   \__,_|_|  |___/\___|_|
```

Template a helm chart with the Helm CLI and load the manifests into an array of JavaScript objects. Mainly intended for use within a test suite.

Helm charts can get very complicated at scale, with an infinite combination of values that can be passed to the chart by consumers. With Helm Parser, you can write comprehensive tests for your chart, using your favourite JS testing framework.

## Features

- [x] Loads the chart's manifests into an array of JavaScript objects
- [x] Helper functions to easily pick out a specific manifest
- [x] You can provide a TypeScript type your values (or autogenerate one from a JSON schema)
- [x] Usage with any JS test framework
- [x] Includes TypeScript definitions

## Prerequisites

- Helm CLI installed on system

## Installation

```bash
npm install helm-parser
```

## Usage

```ts
import path from "path";
import { HelmParser } from "helm-parser";


const helmParser = new HelmParser<ValuesSchema>({
  chartPath: path.resolve(__dirname, "./path-to/my-chart-dir");
});

const result = helmParser.template({
  chartPath,
  namespace: "my-namespace",
  releaseName: "my-release",
  values: {
    replicaCount: 3,
  },
});

const deployments = result.manifests.filter((manifest) => manifest.kind === "Deployment");
```

## Helper functions

```ts
const deployments = result.getDeployments();
const myDeployment = result.getDeployment("my-deployment");

const services = result.getServices();
const myService = result.getService("my-service");

const ingresses = result.getIngresses();
const myIngress = result.getIngress("my-ingress");
```

## Usage with Mocha

### Optionally add a JSON Schema to your chart

You should place this alongside your `Chart.yaml` file.

This is a helm feature which will validate parameters, as well as allow you to generate a typescript definition for your values.

<https://helm.sh/docs/topics/charts/#schema-files>

`values.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "replicaCount": {
      "type": "number"
    },
    "something": {
      "type": "string",
      "enum": ["a", "b", "c"]
    }
  }
}
```

### Install depdenencies

````bash

```bash
npm install -D helm-parser mocha chai @types/chai @types/mocha esbuild esbuild-register json-schema-to-typescript typescript
````

### Configure scripts

`package.json`

```json
{
  // ...
  "scripts": {
    "test": "mocha",
    "pretest": "npm run generate-types",
    "generate-types": "json2ts ./path-to/my-chart-dir/values.schema.json > ./test/values-schema.d.ts"
  }
}
```

### Configure mocha

`.mocharc.json`

```json
{
  "$schema": "https://json.schemastore.org/mocharc",
  "require": ["esbuild-register"],
  "watch-extensions": ["ts"],
  "extension": ["ts"],
  "recursive": true,
  "reporter": "spec",
  "timeout": 60000,
  "exit": true
}
```

### Write tests

`test/chart.tests.ts`

```ts
import { describe, it } from "mocha";
import { expect } from "chai";
import path from "path";
import { HelmParser } from "helm-parser";
import { ValuesSchema } from "./values-schema";

const helmParser = new HelmParser<ValuesSchema>({
  chartPath: path.resolve(__dirname, "../charts/my-chart"),
});

describe("chart tests", () => {
  it("can set replicas to 3", () => {
    const result = helmParser.template({
      namespace: "my-namespace",
      releaseName: "my-release",
      values: {
        replicaCount: 3,
      },
    });
    const deployment = result.getDeployment("my-deployment");
    expect(deployment.spec.replicas).to.equal(3);
  });
});
```
