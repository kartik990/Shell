//imports
const fs = require("fs");
const find = require("find-process");
const spawn = require("child_process").spawn;
const homedir = require("os").homedir();

// Change Directory
export const changeDirectory = (command) => {
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
};

// List Directory
export const listDirectory = async (command) => {
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
};

// Bring from background to foreground
export const bgToFG = async (command) => {
  const args = command.slice(3);
  try {
    const list = await find("pid", args);
    if (list.length === 0) throw new Error("Process not found!!!");
    console.log(list);
  } catch (err) {
    console.log(err.stack || err);
  }
};

// Bring from foreground to background
export const fgToBg = async (command) => {
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
};

// Run binaries
export const runBin = (command) => {
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
};
