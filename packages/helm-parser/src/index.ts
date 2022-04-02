import shell from "shelljs";
import yaml from "yamljs";
import fs from "fs";
import path from "path";
import { PartialDeep } from "type-fest";
import { ObjectMeta } from "kubernetes-types/meta/v1";
import { Deployment } from "kubernetes-types/apps/v1";
import { Ingress } from "kubernetes-types/networking/v1beta1";

/**
 * Base type for all kubernetes objects
 */
export interface Manifest {
  apiVersion: string | any;
  kind?: string | any;
  metadata?: ObjectMeta;
  [key: string]: any;
}

export interface ParseHelmChartOptions<TValuesSchema = any> {
  values: PartialDeep<TValuesSchema>;
  namespace: string;
  releaseName: string;
}

export interface ParserOptions {
  chartPath: string;
}

export const createHelmParser = <THelmChartValues = any>(parserOptions: ParserOptions) => {
  return {
    template: (options: ParseHelmChartOptions<THelmChartValues>) => {
      const { values, namespace, releaseName } = options;
      const { chartPath } = parserOptions;
      const valuesYaml = yaml.stringify(values);
      const valuesPath = path.resolve(__dirname, "values.yaml");
      fs.writeFileSync(valuesPath, valuesYaml);
      const command = `helm template ${releaseName} ./ --namespace ${namespace} -f ${valuesPath}`;
      const execResult = shell.exec(command, { cwd: chartPath, silent: true });
      const output = execResult.stdout;
      if (execResult.stderr) {
        console.log(execResult.stderr);
      }
      fs.unlinkSync(valuesPath);
      const manifests: Manifest[] = output
        .split("---")
        .map(yaml.parse)
        .filter(Boolean);

      const deployments = manifests.filter(manifest => manifest.kind === "Deployment") as Deployment[];
      const ingresses = manifests.filter(manifest => manifest.kind === "Ingress") as Ingress[];

      return {
        manifests,
        deployments,
        ingresses
      };
    }
  };
};
