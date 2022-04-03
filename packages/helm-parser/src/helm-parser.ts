import shell from "shelljs";
import yaml from "yamljs";
import fs from "fs";
import path from "path";
import { PartialDeep } from "type-fest";
import { Manifest } from "./manifest";
import { TemplateResult } from "./template-result";

export interface HelmParserOptions {
  chartPath: string;
}

export interface TemplateOptions<TValuesSchema = any> {
  values: PartialDeep<TValuesSchema>;
  namespace: string;
  releaseName: string;
  debug?: boolean;
}

export class HelmParser<THelmChartValues = any> {
  constructor(private helmParserOptions: HelmParserOptions) {}

  template(templateOptions: TemplateOptions<THelmChartValues>) {
    const { values, namespace, releaseName, debug } = templateOptions;
    const { chartPath } = this.helmParserOptions;
    const valuesYaml = yaml.stringify(values);
    const valuesPath = path.resolve(__dirname, "values.yaml");
    fs.writeFileSync(valuesPath, valuesYaml);
    const command = `helm template ${releaseName} ./ --namespace ${namespace} -f ${valuesPath}`;
    const execResult = shell.exec(command, { cwd: chartPath, silent: true });
    const output = execResult.stdout;
    if (execResult.stderr) {
      console.log(execResult.stderr);
      throw new Error("Error running helm template");
    }
    fs.unlinkSync(valuesPath);
    if (debug) {
      console.log(output);
    }
    const manifests: Manifest[] = output.split("---").map(yaml.parse).filter(Boolean);

    return new TemplateResult(manifests);
  }
}
