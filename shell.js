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

// Emit keypress to stdin
readline.emitKeypressEvents(process.stdin);

// Print leading statement
function defaultPrint() {
  process.stdout.write(`NodeJs SHELL::  ${directoryPath} $ `);
}

console.log("Ready to take commands...");
defaultPrint();

// Change Directory
async function changeDirectory(command) {
  try {
    if (command.length === 2) {
      directoryPath = homedir;
      return;
    }
    const args = command.slice(3);
    await fs.promises.readdir(directoryPath + "/" + args);
    if (path.isAbsolute(args)) {
      directoryPath = args;
    } else {
      const anotherPath = path.join(directoryPath, args);
      directoryPath = path.resolve(directoryPath, anotherPath);
    }
  } catch (e) {
    console.log("Path not found!");
  }
}

// List Directory
async function listDirectory(command) {
  const length = command.length;
  let pathToConsider = null;
  // if ls command with args
  if (length > 3) {
    const args = command.slice(3);
    // ls for absolute directory
    if (path.isAbsolute(args)) {
      pathToConsider = args;
    } else {
      // ls for relative directory`
      pathToConsider = path.join(directoryPath, args);
    }
  } else {
    // if ls command in alone
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
    
    pid = list[0].pid;

    child = spawn('kill', ['-SIGCONT', pid], {stdio:'inherit'});

    child.pid = pid;

    child.on('error', (err) => {
      console.error(err);
      defaultPrint();
    })

    child.on('message', (message) => {
      console.log(message);
      defaultPrint();
    })

  } catch (err) {
    console.log(err.stack || err);
  }
}

// Run binaries
function runBin(command) {
  try {
    const args = command.split(" ");
    child = spawn(
      args[0],
      args.slice(1, args.length),
      {
        stdio: "inherit",
      }
    );

    child.on('error', (err) => {
      console.error(err);
      defaultPrint();
    })

    child.on('message', (message) => {
      console.log(message);
      defaultPrint();
    })

    child.on('close', (code) => {
      console.log('CHILD CLOSED - ' + code);
      defaultPrint();
    })

  } catch (e) {
    console.log("Invalid command!  Try Again...");
  }
}

// Handle all commands
async function handleCommand(line) {
  const command = line.toString().trim();

  if (command.startsWith("cd")) {
    await changeDirectory(command);
  } else if (command.startsWith("ls")) {
    await listDirectory(command);
  } else if (command === "pwd") {
    console.log(directoryPath);
  } else if (command === "exit") {
    console.log("Closing the Shell...");
    process.exit();
  } else if (command.startsWith("fg")) {
    await bgToFG(command);
    return;
  } else {
    runBin(command);
    return;
  }

  defaultPrint();
}

// Input data
stdin.addListener("data", handleCommand);

// SIGINT
// Handle Ctrl + C
process.on("SIGINT", function () {
  if (child) {
    child.kill('SIGINT');
    child = null;
    console.log("\nStopping child process . . .");
    defaultPrint();
  }
});

// SIGTSTP
// Handle Ctrl + Z
process.on("SIGTSTP", function () {
  if (child) {
    console.log("\nPut child process to background. . .");
    console.log(`Background Process ID : ${child.pid}`);
    child.kill('SIGTSTP');
    child = null;
    defaultPrint();
  }
});

