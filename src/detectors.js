
module.exports = {
  ".js": {
    name: "JavaScriptDependency",
    language: () => { return require("tree-sitter-javascript"); },
    selectors: [
      {
        name: "Require",
        selector: "call_expression.identifier[text=require][childCount=0]",
        getModule: (node) => { return node.nextSibling.firstNamedChild.text; }
      },
      {
        name: "Import",
        selector: "import_statement.import[text=import]",
        getModule: (node) => { return node.parent.child(3).firstNamedChild.text; },
      }
    ]
  }
};
