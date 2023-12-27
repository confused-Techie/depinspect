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

  let depsFound;

  switch(ext) {
    case ".js":
      depsFound = await findJavascriptDeps(file);
      break;
  }

  const dep = new FileDependency();
  dep.filepath = filepath;
  //dep.file = file;
  dep.ext = ext;
  dep.addCodeDependents(depsFound);

  return dep;
}

function descendNodeUntilMatch(node, wantedType) {
  let otherNodes = [];
  // First we check if we can descend on this node
  if (node.childCount > 0) {
    for (let i = 0; i < node.childCount; i++) {
      otherNodes = otherNodes.concat(descendNodeUntilMatch(node.child(i), wantedType));
    }
  }
  if (node.type == wantedType) {
    otherNodes = otherNodes.concat(node);
  }

  return otherNodes;
}

async function findJavascriptDeps(code) {
  const { JavaScriptDependency } = require("./models/codeDependency.js");
  const language = require("tree-sitter-javascript");
  const parser = new Parser();
  parser.setLanguage(language);

  const tree = parser.parse(code);

  const selector = new Selector("call_expression.identifier[text=require][childCount=0]");

  let nodes = inspectTree(tree, selector);
  
  let dependencyNodes = [];

  for (let i = 0; i < nodes.length; i++) {
    dependencyNodes.push(new JavaScriptDependency(nodes[i]));
  }

  return dependencyNodes;
}
