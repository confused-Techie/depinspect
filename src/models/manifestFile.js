
class ManifestFile {
  constructor(file) {
    this.name = "ManifestFile";
    this.file = file;
    this.dependencies = {};
    this.devDependencies = {};
    this.peerDependencies = {};
    this.optionalDependencies = {};
  }

  init() {
    // These methods MUST be declared by extenders
    this.init_dependencies();
    this.init_devDependencies();
    this.init_peerDependencies();
    this.init_optionalDependencies();
  }

  init_dependencies() {
    console.warning("init_dependencies() Should be implmented by a consumer!");
  }

  init_devDependencies() {
    console.warning("init_devDependencies() Should be implemented by a consumer!");
  }

  init_peerDependencies() {
    console.warning("init_peerDependencies() Should be implemented by a consumer!");
  }

  init_optionalDependencies() {
    console.warning("init_optionalDependencies() Should be implemented by a consumer!");
  }

}

class ManifestFileNodeJS extends ManifestFile {
  constructor(file) {
    super(file);
    this.name = "ManifestNodeJS";

    this.init();
  }

  init_dependencies() {
    this.dependencies = this.file.dependencies ?? {};
  }

  init_devDependencies() {
    this.devDependencies = this.file.devDependencies ?? {};
  }

  init_peerDependencies() {
    this.peerDependencies = this.file.peerDependencies ?? {};
  }

  init_optionalDependencies() {
    this.optionalDependencies = this.file.optionalDependencies ?? {};
  }
}

module.exports = {
  ManifestFile,
  ManifestFileNodeJS
};
