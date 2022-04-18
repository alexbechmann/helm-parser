import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { runCommand } from "./run-command";

const argv: any = yargs(hideBin(process.argv)).argv;

const name = argv._[0];
const { chartPath } = argv;
const absoluteTestsPath = path.resolve(process.cwd(), name);
const exists = fs.existsSync(absoluteTestsPath);

if (exists) {
  console.log(chalk.red(`${name} already exists`));
  process.exit(1);
} else {
  createTestsProject();
}

async function createTestsProject() {
  fs.mkdirp(absoluteTestsPath);
  await runCommand({
    cmd: "npm init -y",
    cwd: absoluteTestsPath,
    label: "Initializing test project",
  });
  await runCommand({
    cmd: "npm install -D helm-parser vitest json-schema-to-typescript typescript",
    cwd: absoluteTestsPath,
    label: "Installing dependencies",
  });

  console.log(`${chalk.green("Helm tests project created")} at ${absoluteTestsPath}`);
}
