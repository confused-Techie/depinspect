
module.exports = {
  ".js": {
    name: "JavaScriptDependency",
    language: () => { return require("tree-sitter-javascript"); },
    selectors: [
      {
        selector: "call_expression.identifier[text=require][childCount=0]",
        getModule: (node) => { return node.nextSibling.firstNamedChild.text; }
      }
    ]
  }
};
