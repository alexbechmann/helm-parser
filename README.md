# Helm Parser

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=rounded-square)](https://github.com/prettier/prettier)
[![CI](https://github.com/alexbechmann/helm-parser/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/alexbechmann/helm-parser/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/helm-parser.svg)](https://www.npmjs.com/package/helm-parser)

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
- [x] Typed manifests
- [x] You can provide a type your values (or autogenerate one from a JSON schema)
- [x] Helper functions to easily pick out a specific manifest
- [x] Usage with any JS test framework

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

const helmParser = new HelmParser({
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

## Usage for testing

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

### Bootstrap project

```bash
npx create-helm-tests my-tests --chart-path ./path-to/my-chart-dir
```

### Write tests

`test/main.test.ts`

```ts
test("can set replicas to 3", () => {
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
```
