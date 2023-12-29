const Parser = require("tree-sitter");
const language = require("tree-sitter-javascript");

const fs = require("fs");

(async () => {
  const file = process.argv.slice(2)[0];

  const code = fs.readFileSync(file, { encoding: "utf8" });

  const parser = new Parser();
  parser.setLanguage(language);

  const tree = parser.parse(code);

  const obj = await createNodeObj(tree.rootNode);

  fs.writeFileSync("debug-file.json", JSON.stringify(obj, null, 4), { encoding: "utf8" });
  
})();

async function createNodeObj(node) {
  let obj = {
    type: node.type,
    text: node.text,
    startPosition: node.startPosition,
    endPosition: node.endPosition,
    childCount: node.childCount,
    children: []
  };

  for (let i = 0; i < node.childCount; i++) {
    let tmpObj = await createNodeObj(node.child(i));
    obj.children.push(tmpObj);
  }

  return obj;
}
