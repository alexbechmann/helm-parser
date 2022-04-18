// import ora from "ora";
const spawn = require("child_process").spawn;

export const runCommand = ({ cmd, cwd, label }: { cwd: string; cmd: string; label: string }) => {
  // const spinner = ora({
  //   text: label,
  //   spinner: "dots",
  // });

  console.log(label);

  return new Promise<void>((resolve, reject) => {
    var process = spawn(cmd, { shell: true, cwd });
    // spinner.start();
    process.on("exit", () => {
      resolve();
      // spinner.stop();
    });
  });
};
