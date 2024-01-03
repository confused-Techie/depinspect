
class CodeDependency {
  constructor(node) {
    this.name = "CodeDependency";
    this.node = node;
    this.rawModule = node.text;
    this.module = node.text;
    this.kind = null;
  }

  setKind(value) {
    // The kind here refers to what kind of dependency this is.
    // * file: This dependency is on another local file
    // * dep: This dependency is a standard dependency in this environment
    // * buitin: This dependency is builtin to this environment
    let validKinds = [ "file", "dependency", "builtin" ];
    if (validKinds.includes(value)) {
      this.kind = value;
    }
  }
}

module.exports = {
  CodeDependency
};
