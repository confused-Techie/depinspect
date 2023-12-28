const path = require("path");
const fs = require("fs");
const { isBuiltin } = require("node:module");
const Parser = require("tree-sitter");
const inspectTree = require("./inspectTree.js");
const Selector = require("./selector.js");
const FileDependency = require("./models/fileDependency.js");

module.exports =
async function findFileDeps(filepath) {
  let ext = path.extname(filepath);
  let file = fs.readFileSync(filepath, { encoding: "utf8" });

  let depsFound = await findCodeDeps(ext, file, filepath);

  const dep = new FileDependency();
  dep.filepath = filepath;
  //dep.file = file;
  dep.ext = ext;
  dep.addCodeDependents(depsFound);

  return dep;
}

async function findCodeDeps(ext, code, filepath) {
  // A Universal Code Dep Collection Function
  const { CodeDependency } = require("./models/codeDependency.js");
  const detectors = require("./detectors.js");

  if (detectors[ext]) {
    const parser = new Parser();
    parser.setLanguage(detectors[ext].language());

    const tree = parser.parse(code);

    if (process.WRITE_NODE) {
      const writeNodeObj = require("./writeNodeObj.js");
      await writeNodeObj(tree);
    }

    let dependencyNodes = [];

    for (let i = 0; i < detectors[ext].selectors.length; i++) {
      const selector = new Selector(detectors[ext].selectors[i].selector);

      let nodes = inspectTree(tree, selector);

      for (let y = 0; y < nodes.length; y++) {
        let dep = new CodeDependency(nodes[y]);
        dep.name = detectors[ext].name;
        dep.rawModule = detectors[ext].selectors[i].getModule(dep.node);
        dep.module = validateModule(detectors[ext].name, dep.rawModule, filepath);

        dependencyNodes.push(dep);
      }
    }

    return dependencyNodes;

  } else {
    // We can't find any deps since we don't know how to parse.
    if (process.VERBOSE) {
      console.error(`DepInspect doesn't know how to parse a file ending with: ${ext}! Skipping...`);
    }
    return [];
  }
}

function validateModule(detectorName, modToImport, filePath) {
  // This function exists to take the raw import string for a module, and determine
  // what it's "clean" form is. This may mean resolving local filepaths, or could
  // just be removing quotes around it. But it should be able to take the following
  // examples:
  // require('../src/main.js') => /home/user/project/src/main.js
  // require('someBuiltin') => someBuiltin
  //
  // modToImport = The module string of what we are importing
  // filePath = The path to the file that is doing the importing

  let mod = modToImport.replace(/"/g, "").replace(/'/g, "");
  let modPath = path.parse(filePath);

  switch(detectorName) {
    case "JavaScriptDependency":
      let modRequire;

      try {
        modRequire = require.resolve(mod, { paths: [ modPath.dir ] });
      } catch(err) {
        // This likely means the module isn't installed or available locally.
        // Which is fine, so we will just assume that this is a module that
        // should be installed, and append the raw text back to the var
        modRequire = mod;
      }

      if (modRequire.includes("node_modules")) {
        // This looks like it's an installed module. Return the cleaned up string
        return mod;
      } else {
        // This isn't an installed module
        if (isBuiltin(modRequire)) {
          // This module was resolved to just the module name, since it's built in
          // We can still just return the cleaned up string
          return mod;
        } else {
          // Looks like we successfully resolved a file to it's filename
          // But to avoid overly complex logic later, we don't want to store
          // the full file path here, instead opting to shorten this down to
          // a relative path from the root of our project, that way it's universal
          let relative = path.relative(process.DEPINSPECT_DIRECTORY, modRequire);
          return relative;
        }
      }
      break;
    default:
      // Unsure what to do
      return mod;
  }
}
