// Imports
const path = require("path");
const fs = require("fs");
const find = require("find-process");
const homedir = require("os").homedir();
var readline = require("readline");
const spawn = require("child_process").spawn;

// Constants
const stdin = process.openStdin();

// Current Directory
let directoryPath = path.join(homedir);

// Child process
let child = null;

//  Emit keypress to stdin
readline.emitKeypressEvents(process.stdin);

// Print leading statement
function defaultPrint() {
  process.stdout.write(`NodeJs SHELL::  ${directoryPath} $ `);
}

console.log("Ready to take commands...");
defaultPrint();

// Change Directory
async function changeDirectory(command) {
  if (command.length === 2) {
    directoryPath = homedir;
    return;
  }
  const args = command.slice(3);

  if (path.isAbsolute(args)) {
    directoryPath = args;
  } else {
    const anotherPath = path.join(directoryPath, args);
    directoryPath = path.resolve(directoryPath, anotherPath);
  }
}

// List Directory
async function listDirectory(command) {
  const length = command.length;
  let pathToConsider = null;
  //if ls command with args
  if (length > 3) {
    const args = command.slice(3);
    //ls for absolute directory
    if (path.isAbsolute(args)) {
      pathToConsider = args;
    } else {
      //ls for relative directory`
      pathToConsider = path.join(directoryPath, args);
    }
  } else {
    //if ls command in alone
    pathToConsider = directoryPath;
  }
  try {
    const files = await fs.promises.readdir(pathToConsider);
    files.forEach((file) => console.log(file));
  } catch (err) {
    if (err) {
      console.log("Unable to scan directory: " + err);
    }
  }
}

// Bring from background to foreground
async function bgToFG(command) {
  const args = command.slice(3);
  try {
    const list = await find("pid", args);
    if (list.length === 0) throw new Error("Process not found!!!");
    console.log(list);
  } catch (err) {
    console.log(err.stack || err);
  }
}

// Bring from foreground to background
async function fgToBg(command) {
  try {
    const args = command.split(" ");
    child = spawn(
      // directoryPath + "\\" +
      "start",
      args.slice(1, args.length),
      {
        shell: true,
      }
    );
    console.log(child.pid);
  } catch (e) {
    console.log("Could not bring the process to background !!!");
  }
}

// Run binaries
function runBin(command) {
  try {
    const args = command.split(" ");
    child = spawn(
      // directoryPath + "\\" +
      args[0],
      args.slice(1, args.length),
      {
        stdio: "inherit",
      }
    );
  } catch (e) {
    console.log("Invalid command!  Try Again...");
  }
}

// Handle all commands
async function handleCommand(line) {
  const command = line.toString().trim();

  if (command.startsWith("cd")) {
    changeDirectory(command);
  } else if (command.startsWith("ls")) {
    await listDirectory(command);
  } else if (command === "pwd") {
    console.log(directoryPath);
  } else if (command === "exit") {
    console.log("Closing the Shell...");
    process.exit();
  } else if (command.startsWith("fg")) {
    await bgToFG(command);
  } else if (command.startsWith("bg")) {
    await fgToBg(command);
  } else {
    runBin();
  }

  defaultPrint();
}

// Input data
stdin.addListener("data", handleCommand);

// SIGINT
process.on("SIGINT", function () {
  if (child) {
    child.kill();
    child = null;
    console.log("\nStopping child process . . .");
    defaultPrint();
  }
});
