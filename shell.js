const path = require("path");
const fs = require("fs");
const find = require("find-process");
const homedir = require("os").homedir();
var readline = require("readline");
const spawn = require("child_process").spawn;

let directoryPath = path.join(homedir);

const stdin = process.openStdin();
readline.emitKeypressEvents(process.stdin);

function defaultPrint() {
  process.stdout.write(`NodeJs SHELL::  ${directoryPath} $`);
}

console.log("Ready to take commands...");
defaultPrint();

process.stdin.on("keypress", (str, key) => {
  if (key.ctrl && key.name === "c") {
    process.exit();
  } else if (key.ctrl && key.name === "z") {
    console.log(process.pid);
  }
});

stdin.addListener("data", async function (line) {
  const command = line.toString().trim();

  if (command == "cd") {
    directoryPath = homedir;
  } else if (command.startsWith("cd ")) {
    const args = command.slice(3);
    if (path.isAbsolute(args)) {
      directoryPath = args;
    } else {
      const anotherPath = path.join(directoryPath, args);
      directoryPath = path.resolve(directoryPath, anotherPath);
    }
  } else if (command.startsWith("ls")) {
    const length = command.length;
    var pathToConsider = null;
    if (length > 3) {
      const args = command.slice(3);
      pathToConsider = args;
    } else {
      pathToConsider = directoryPath;
    }
    try {
      const files = await fs.promises.readdir(pathToConsider);
      files.forEach(function (file) {
        console.log(file);
      });
    } catch (err) {
      if (err) {
        console.log("Unable to scan directory: " + err);
      }
    }
  } else if (command === "pwd") {
    console.log(directoryPath);
  } else if (command === "exit") {
    console.log("Closing the Shell...");
    process.exit();
  } else if (command.startsWith("fg ")) {
    const args = command.slice(3);
    try {
      const list = await find("pid", args);
      console.log(list);
    } catch (err) {
      console.log(err.stack || err);
    }
  } else {
    try {
      const args = command.split(" ");
      spawn(args[0], args.slice(1, args.length), { stdio: "inherit" });
    } catch {
      console.log("Invalid command!  Try Again...");
    }
  }
  defaultPrint();
});
