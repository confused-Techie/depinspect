const fs = require("fs");

module.exports =
async function writeNodeObj(tree) {
  // This function exists to turn a Tree Sitter Tree into a JSON object,
  // and write out it's results.
  // The only purpose this really serves is to help debug what's going on.

  let obj = await createNodeObj(tree.rootNode);

  fs.writeFileSync("debug-file.json", JSON.stringify(obj, null, 4), { encoding: "utf8" });
}

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
