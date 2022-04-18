import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { runCommand } from "./run-command";
import prettier from "prettier";

async function run(args: any) {
  const argv: any = yargs(hideBin(args)).argv;

  const name = argv._[0];
  const { chartPath } = argv;

  if (!name) {
    console.log(chalk.red("You must specify a name for your tests project"));
    process.exit(1);
  }

  if (!chartPath) {
    console.log(chalk.red("You must specify a chart path with --chart-path"));
    process.exit(1);
  }

  const absoluteTestsPath = path.resolve(process.cwd(), name);
  const testsPath = path.resolve(process.cwd(), name, "test");
  const testFilePath = path.resolve(process.cwd(), name, "test/main.test.ts");
  const exists = fs.existsSync(absoluteTestsPath);

  if (exists) {
    console.log(chalk.red(`${name} already exists`));
    process.exit(1);
  } else {
    createTestsProject();
  }

  async function createTestsProject() {
    await fs.mkdirp(absoluteTestsPath);
    await fs.mkdirp(testsPath);

    const relativePathToChartFromPackageJson = path.join("../", chartPath);
    const relativePathToChartFromTestFile = path.join("../../", chartPath);
    const helmSchemaPath = path.resolve(process.cwd(), chartPath, "values.schema.json");
    const chartYamlPath = path.resolve(process.cwd(), chartPath, "Chart.yaml");
    const helmSchemaExists = fs.existsSync(helmSchemaPath);
    const packageJsonPath = path.resolve(process.cwd(), name, "package.json");
    const absolutePackageJsonPath = path.resolve(absoluteTestsPath, "package.json");

    if (!fs.existsSync(chartYamlPath)) {
      console.log(`Chart.yaml file not found in ${chartPath}`);
      process.exit(1);
    }

    await runCommand({
      cmd: "npm init -y",
      cwd: absoluteTestsPath,
      label: "Initializing test project",
    });
    const packageJson = require(packageJsonPath);

    let helmParserLines = ``;

    packageJson.scripts.test = "vitest";

    if (helmSchemaExists) {
      console.log(`${chalk.blue("Found values.schema.json")} in ${chartPath}`);
      helmParserLines = `import { ValuesSchema } from "./values-schema";

    const helmParser = new HelmParser<ValuesSchema>({
      chartPath: path.resolve(__dirname, "${relativePathToChartFromTestFile}"),
    });
    `;
      packageJson.scripts.pretest = "npm run generate-types";
      packageJson.scripts["generate-types"] = `json2ts ${path.join(
        relativePathToChartFromPackageJson,
        "values.schema.json"
      )} > ./test/values-schema.d.ts`;
    } else {
      console.log(chalk.yellow(`Could not find values.schema.json in ${chartPath}`));
      helmParserLines = `
    interface ValuesSchema {}

    const helmParser = new HelmParser<ValuesSchema>({
      chartPath: path.resolve(__dirname, "${relativePathToChartFromTestFile}"),
    });
    `;
    }

    const testFileContents = `import path from "path";
    import { expect, test } from "vitest";
    import { HelmParser } from "helm-parser";
    ${helmParserLines}

    test("can set replicas to 3", () => {
      const result = helmParser.template({
        namespace: "my-namespace",
        releaseName: "my-release",
        values: {},
      });
      expect(result.manifests.length > 0).to.be.true;
    });
    `;

    await fs.writeFile(testFilePath, prettier.format(testFileContents, { parser: "typescript" }));
    await fs.writeFile(absolutePackageJsonPath, prettier.format(JSON.stringify(packageJson), { parser: "json" }));
    await runCommand({
      cmd: "npm install -D helm-parser vitest json-schema-to-typescript typescript",
      cwd: absoluteTestsPath,
      label: "Installing dependencies",
    });
    if (helmSchemaExists) {
      await runCommand({
        cmd: "npm run generate-types",
        cwd: absoluteTestsPath,
        label: "Generating values.schema types",
      });
    }
    console.log(`${chalk.green("Helm tests project created")} at ${absoluteTestsPath}`);
    console.log(`cd ${name}`);
    console.log(`npm test`);
  }
}

export default run;
