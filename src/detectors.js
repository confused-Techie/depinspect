const path = require("path");
const { isBuiltin } = require("node:module");


module.exports = {
  ".js": {
    name: "JavaScriptDependency",
    language: () => { return require("tree-sitter-javascript"); },
    selectors: [
      {
        name: "Require",
        selector: ".call_expression > .identifier[text=require][childCount=0]#nextSibling#firstNamedChild::text"
      },
      {
        name: "Import",
        selector: ".import_statement > .import[text=import]#parent:child(3)#firstNamedChild::text"
      }
    ],
    validateModule: (rawModule, filepath, rootFilePath) => {
      // Method provides a "clean" module return:
      // * Returns builtin modules properly
      // * Relativilizes filepaths to the rootFilePath
      // * Cleans up quotations on strings
      let mod = rawModule
        .replace(/^"/g, "").replace(/"$/g, "")
        .replace(/^'/g, "").replace(/'$/g, "");

      let modPath = path.parse(filepath);

      let modRequire;

      try {
        modRequire = require.resolve(mod, { paths: [ modPath.dir ] });
      } catch(err) {
        // Likely means the module isn't installed or available locally
        // which is fine, we will assume this just means the module should
        // be installed, and return the cleaned string
        return mod;
      }

      if (modRequire.includes("node_modules")) {
        // Looks like an assigned module. Return the cleaned string
        return mod;
      } else {
        // This isn't an installed module
        if (isBuiltin(modRequire)) {
          // This module was resolve to just a module name, since it's built in
          // we can still just return the cleaned up string
          return mod;
        } else {
          // Looks like we successfully resolved a file to it's filename
          // but we will want to make sure to relativilizes
          return path.relative(rootFilePath, modRequire);
        }
      }
    }

  }
};
