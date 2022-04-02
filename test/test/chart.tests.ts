import { describe, it } from "mocha";
import { expect } from "chai";
import path from "path";
import { createHelmParser } from "../../packages/helm-parser/src/index";
import { ValuesSchema } from "./values-schema";

const helmParser = createHelmParser<ValuesSchema>({
  chartPath: path.resolve(__dirname, "../charts/my-chart"),
});

describe("chart tests", () => {
  it("can set replicas to 3", () => {
    const { manifests } = helmParser.template({
      namespace: "my-namespace",
      releaseName: "my-release",
      values: {
        replicaCount: 3,
      },
    });
    const deployment = manifests.filter((manifest) => manifest.kind === "Deployment")[0];
    expect(deployment.spec.replicas).to.equal(3);
  });

  it("can search deployments only", async () => {
    const { deployments } = helmParser.template({
      namespace: "my-namespace",
      releaseName: "my-release",
      values: {
        replicaCount: 3,
      },
    });

    expect(deployments.every((deployment) => deployment.kind === "Deployment")).to.be.true;
  });
});
