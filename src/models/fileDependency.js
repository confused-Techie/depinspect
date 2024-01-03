
module.exports =
class FileDependency {
  constructor() {
    this.filepath;
    this.file;
    this.ext;
    this.nodes = new Set();
    // Helpful for later steps that try to rely on `kind` info from code
    // dependencies, we add it arbitrarily here
    this.kind = "file";
  }

  addCodeDependents(deps) {
    if (Array.isArray(deps)) {
      for (let i = 0; i < deps.length; i++) {
        this.nodes.add(deps[i]);
      }
    }
  }
}
