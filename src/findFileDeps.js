const path = require("path");
const fs = require("fs");
const Parser = require("tree-sitter");
const inspectTree = require("./inspectTree.js");
const Selector = require("./selector.js");
const FileDependency = require("./models/fileDependency.js");

module.exports =
async function findFileDeps(filepath) {
  let ext = path.extname(filepath);
  let file = fs.readFileSync(filepath, { encoding: "utf8" });

  let depsFound = await findCodeDeps(ext, file);

  const dep = new FileDependency();
  dep.filepath = filepath;
  //dep.file = file;
  dep.ext = ext;
  dep.addCodeDependents(depsFound);

  return dep;
}

async function findCodeDeps(ext, code) {
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
        dep.module = detectors[ext].selectors[i].getModule(dep.node);

        dependencyNodes.push(dep);
      }
    }

    return dependencyNodes;

  } else {
    // We can't find any deps since we don't know how to parse.
    console.error(`DepInspect doesn't know how to parse a file ending with: ${ext}! Skipping...`);
    return [];
  }
}
