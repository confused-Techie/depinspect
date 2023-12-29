
class CodeDependency {
  constructor(node) {
    this.name = "CodeDependency";
    this.node = node;
    this.rawModule = node.text;
    this.module = node.text;
  }
}

module.exports = {
  CodeDependency
};
