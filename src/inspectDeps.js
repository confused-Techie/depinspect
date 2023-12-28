
module.exports =
async function traceDeps(opts, deps) {
  // This function can be handed a deps object from `collectDeps`
  // and will provide stats about the deps required

  let depsUsage = {};

  await iterateAllDeps(deps, (mod, usedBy) => {
    if (!depsUsage[mod]) {
      console.log(mod.toString());
      console.log(mod);
      depsUsage[mod] = [];
    }
    if (usedBy) {
      depsUsage[mod].push(usedBy);
    }
  });

  // TODO fix the raw data
  // TODO inform about the raw data
  return depsUsage;
}

async function iterateAllDeps(deps, callback) {
  // Here we will attempt to iterate every form of dependency that may exist.
  // Using the callback, to provide the module name, as well as who, if anyone
  // is using it.

  for (const mod in deps.manifest.dependencies) {
    callback(mod, false);
  }

  for (const mod in deps.manifest.devDependencies) {
    callback(mod, false);
  }

  for (const mod in deps.manifest.peerDependencies) {
    callback(mod, false);
  }

  for (const mod in deps.manifest.optionalDependencies) {
    callback(mod, false);
  }

  for (const file in deps.app) {
    callback(file, false);

    let modIterator = deps.app[file].nodes.entries();

    for (const mod of modIterator) {
      let modEntry = mod[0];

      callback(modEntry.module, file);
    }
  }
}
