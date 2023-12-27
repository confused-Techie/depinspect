
class CodeDependency {
  constructor(node) {
    this.name = "CodeDependency";
    this.node = node;
  }

  get module() {
    return node.text;
  }
}

class JavaScriptDependency extends CodeDependency {
  constructor(node) {
    super(node);
    this.name = "JavaScriptDependency";
  }

  get module() {
    return node.nextSibling.firstNamedChild.text;
  }
}

module.exports = {
  CodeDependency,
  JavaScriptDependency
};
