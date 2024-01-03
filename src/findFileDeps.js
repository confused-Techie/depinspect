const path = require("path");
const fs = require("fs");
const Parser = require("tree-sitter");
const inspectTree = require("./inspectTree.js");
const Selector = require("./selector.js");
const FileDependency = require("./models/fileDependency.js");
const SelectorTreeSitter = require("selector-tree-sitter");

module.exports =
async function findFileDeps(filepath, unknownExtArray) {
  let ext = path.extname(filepath);

  let depsFound = await findCodeDeps(ext, filepath, unknownExtArray);

  const dep = new FileDependency();
  dep.filepath = filepath;
  //dep.file = file;
  dep.ext = ext;
  dep.addCodeDependents(depsFound);

  return dep;
}

async function findCodeDeps(ext, filepath, unknownExtArray) {
  // A Universal Code Dep Collection Function
  const { CodeDependency } = require("./models/codeDependency.js");
  const detectors = require("./detectors.js");

  if (detectors[ext]) {
    const code = fs.readFileSync(filepath, { encoding: "utf8" });

    const parser = new Parser();
    parser.setLanguage(detectors[ext].language());

    const tree = parser.parse(code);

    let dependencyNodes = [];

    for (let i = 0; i < detectors[ext].selectors.length; i++) {
      const selectorTS = new SelectorTreeSitter(tree, detectors[ext].selectors[i].selector);
      const nodes = selectorTS.execute();

      for (let y = 0; y < nodes.length; y++) {
        // These nodes may be string data, number data, or objects returned
        let dep = new CodeDependency(nodes[y]);
        dep.name = detectors[ext].name;

        if (typeof detectors[ext].selectors[i].getModule === "function") {
          // Here we turn the previously required `getModule` function into
          // an optional function, since the expanded CSS selectors it became less
          // needed, but still may be helpful
          dep.rawModule = detectors[ext].selectors[i].getModule(dep.node);
        } else {
          dep.rawModule = dep.node;
        }

        let validateModule = detectors[ext].validateModule(dep.rawModule, filepath, process.DEPINSPECT_DIRECTORY);
        dep.module = validateModule.module;
        if (typeof validateModule.kind === "string") {
          dep.kind = validateModule.kind;
        }

        // The last stop we want to do is compare this `dep.module` value against
        // our configs substitutions
        let moduleNoWhitespace = dep.module.replace(/\s/g, "");
        if (depinspectOpts.substitutions[moduleNoWhitespace]) {
          dep.module = depinspectOpts.substitutions[moduleNoWhitespace];
        }

        dependencyNodes.push(dep);
      }
    }

    // Play around with some light cleanup
    delete parser;
    delete tree;
    
    return dependencyNodes;

  } else {
    // We can't find any deps since we don't know how to parse.
    if (!unknownExtArray.includes(ext)) {
      unknownExtArray.push(ext);
    }
    return [];
  }
}
