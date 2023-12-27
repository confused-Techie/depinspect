
module.exports =
class FileDependency {
  constructor() {
    this.filepath;
    this.file;
    this.ext;
    this.nodes = new Set();
  }

  addCodeDependents(deps) {
    if (Array.isArray(deps)) {
      for (let i = 0; i < deps.length; i++) {
        this.nodes.add(deps[i]);
      }
    }
  }
}
