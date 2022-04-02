# helm-parser

Template a helm chart with the Helm CLI and load the manifests into an array of JavaScript objects. Mainly intended for use within a test suite.

Helm charts can get very complicated at scale, with an infinite combination of values that can be passed to the chart by consumers. With helm-parser, you can write comprehensive tests for your chart, using your favourite JS testing framework.

## Features

- Includes TypeScript definitions
- You can provide a TypeScript type your values (or autogenerate one from a JSON schema)
- Usage with any JS test framework

## Installation

```bash
npm install helm-parser
```

## Usage

```ts
import path from "path";
import { createHelmParser } from "helm-parser";

interface ValuesSchema = {
  replicaCount: number
}

const helmParser = createHelmParser<ValuesSchema>({
  chartPath: path.resolve(__dirname, "./path-to/my-chart-dir"),
});

const { manifests } = helmParser.template({
  namespace: "my-namespace",
  releaseName: "my-release",
  values: {
    replicaCount: 3
  },
});

const deployments = manifests.filter((manifest) => manifest.kind === "Deployment");
```

## Usage with Mocha

### Optionally add a JSON Schema to your chart

You should place this alongside your `Chart.yaml` file.

This is a helm feature which will validate parameters, as well as allow you to generate a typescript definition for your values.

<https://helm.sh/docs/topics/charts/#schema-files>

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Values",
  "type": "object",
  "properties": {
    "replicaCount": {
      "type": "integer",
      "minimum": 1
    }
  }
}
```

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
npm install -D mocha chai @types/chai @types/mocha esbuild esbuild-register json-schema-to-typescript typescript
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

`test/chart.tests.ts`

```ts
import { describe, it } from "mocha";
import { expect } from "chai";
import path from "path";
import { createHelmParser } from "helm-parser";
import { ValuesSchema } from "./values-schema";

const helmParser = createHelmParser<ValuesSchema>({
  chartPath: path.resolve(__dirname, "./path-to/my-chart-dir"),
});

describe("chart tests", () => {
  it("can set replicas to 3", () => {
    const { deployments } = helmParser.template({
      namespace: "my-namespace",
      releaseName: "my-release",
      values: {
        replicaCount: 3,
      },
    });
    const deployment = deployments[0];

    expect(deployment.spec.replicas).to.equal(3);
  });
});
```
