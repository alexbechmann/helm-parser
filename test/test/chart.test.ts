import { assert, expect, test } from "vitest";
import path from "path";
import { HelmParser } from "../../packages/helm-parser/src/index";
import { ValuesSchema } from "./values-schema";

const helmParser = new HelmParser<ValuesSchema>({
  chartPath: path.resolve(__dirname, "../charts/my-chart"),
});

test("can set replicas to 3", () => {
  const result = helmParser.template({
    namespace: "my-namespace",
    releaseName: "my-release",
    values: {
      replicaCount: 3,
    },
  });
  const deployment = result.manifests.filter((manifest) => manifest.kind === "Deployment")[0];
  expect(deployment.spec.replicas).to.equal(3);
});

test("getDeployment works", async () => {
  const result = helmParser.template({
    namespace: "my-namespace",
    releaseName: "my-release",
    values: {
      replicaCount: 3,
    },
  });
  const deployment = result.getDeployment("my-release-my-chart");
  expect(deployment.spec.replicas).to.equal(3);
});

test("can search deployments only", async () => {
  const result = helmParser.template({
    namespace: "my-namespace",
    releaseName: "my-release",
    values: {
      replicaCount: 3,
    },
  });
  const deployments = result.getDeployments();
  expect(deployments.every((deployment) => deployment.kind === "Deployment")).to.be.true;
});

test("can search ingresses only", async () => {
  const result = helmParser.template({
    namespace: "my-namespace",
    releaseName: "my-release",
    values: {
      replicaCount: 3,
    },
  });
  const ingresses = result.getIngresses();
  expect(ingresses.every((ingress) => ingress.kind === "Ingress")).to.be.true;
});

test("can search services only", async () => {
  const result = helmParser.template({
    namespace: "my-namespace",
    releaseName: "my-release",
    values: {
      replicaCount: 3,
    },
  });
  const services = result.getServices();
  expect(services.every((service) => service.kind === "Service")).to.be.true;
});

test("getService works", async () => {
  const result = helmParser.template({
    namespace: "my-namespace",
    releaseName: "my-release",
    values: {
      replicaCount: 3,
    },
  });
  const service = result.getService("my-release-my-chart");
  expect(service.kind).to.equal("Service");
});
