
class ManifestFile {
  constructor(file) {
    this.name = "ManifestFile";
    this.file = file;
  }

  dependencyArray() {
    throw new Error("Not implemented!");
  }

  dependencyVersion(dep) {
    throw new Error("Not implemented!");
  }
}

class ManifestFileNodeJS extends ManifestFile {
  constructor(file) {
    super(file);
    this.name = "ManifestFileNodeJS";
  }

  dependencyArray({ includeDev = true }) {
    let arr = [];

    if (Array.isArray(this.file.dependencies)) {
      for (const dep of this.file.dependencies) {
        arr.push(dep);
      }
    }

    if (Array.isArray(this.file.devDependencies)) {
      for (const devDep of this.file.devDependencies) {
        arr.push(devDep);
      }
    }

    return arr;
  }

  dependencyVersion(dep) {
    return this.file.dependencies[dep];
  }
}

module.exports = {
  ManifestFile,
  ManifestFileNodeJS
};
