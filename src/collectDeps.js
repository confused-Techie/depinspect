const path = require("node:path");
const fs = require("node:fs");
const findFileDeps = require("./findFileDeps.js");
const ignoreLists = require("./ignoreLists.js");
const manifests = require("./models/manifestFile.js");

module.exports =
async function inspectDeps(opts) {
  let deps = {
    manifest: await readManifest(opts),
    app: await getAppDeps(opts)
  };

  return deps;
}

async function readManifest(opts) {
  // The manifest file refers to whatever file serves as the master list of dependencies
  // for a project. One may not exist, or may come in several forms.
  // We will impliment a top down approach to searching for one.

  // NodeJS `package.json`
  if (fs.existsSync(path.join(opts.directory, "package.json"))) {
    let file = JSON.parse(fs.readFileSync(path.join(opts.directory, "package.json"), { encoding: "utf8" }));
    return new manifests.ManifestFileNodeJS(file);
  } else {
    return {};
  }
}

async function getAppDeps(opts) {
  let foundDeps = {};

  const handleFile = async function(file, pathArray, filename, immediateReturn) {
    // By checking only the path array for ignored directories, we ensure to only
    // ignore directories/files discovered during enumeration, while allowing
    // the directory provided by the user to go against an ignored directory
    if (
      pathArray.every((val) => { return !ignoreLists.directories.includes(val); })
      && !ignoreLists.files.includes(filename)
    ) {
      let fileDeps = await findFileDeps(file);
      foundDeps[filename] = fileDeps;
    }
  };

  await enumerateFiles(opts.directory, [], handleFile);

  return foundDeps;
}

async function enumerateFiles(dir, pathArray, fileCallback) {
  // dir: The starting directory
  // pathArray: The array of path entries
  // fileCallback: Function to invoke when a file is found
  // When a callback is invoked the following is passed:
  // - file: Which is the file and it's preceeding path. A relative path to a specific file.
  // - pathArray: The path as an array leading up to that file, from the initial dir passed.
  // - filename: The specific file's name.
  // - immediateReturn: An overloaded paramter passed only when the immediate dir
  //   passed was a direct file path.

  if (fs.lstatSync(dir).isFile()) {
    // The initial dir is a file, not a dir
    await fileCallback(dir, pathArray, path.basename(dir), true);
    return;
  }

  let files = fs.readdirSync(dir);

  for (const file of files) {
    let target = path.join(dir, file);

    if (fs.lstatSync(target).isDirectory()) {
      await enumerateFiles(target, [ ...pathArray, file], fileCallback);
    } else {
      await fileCallback(target, pathArray, file);
    }
  }
}
