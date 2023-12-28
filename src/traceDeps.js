const path = require("path");

module.exports =
async function traceDeps(opts, deps) {
  // This function can be handed a deps object from `collectDeps`
  // and will use `opts.startTrace` to trace all modules required from that location
  let initMod = path.relative(opts.directory, path.resolve(opts.startTrace));

  if (!deps.app[initMod]) {
    throw new Error(`Initial Trace point doesn't seem valid: ${initMod}`);
  }

  let traceObj = await traceFileDeps(opts.startTrace, deps.app[initMod], deps);

  let output;

  switch(opts.output) {
    case "string":
      output = await craftTraceString(traceObj);
      break;
    case "json":
    default:
      output = traceObj;
      break;
  }

  return output;
}

async function traceFileDeps(moduleName, dep, deps) {
  console.log(dep);
  let fileDeps = [];

  let modIterator = dep.nodes.entries();

  for (const entry of modIterator) {
    let modEntry = entry[0];

    let mod = modEntry.module;

    if (deps.app[mod]) {
      try {
        let deepFileDeps = await traceFileDeps(mod, deps.app[mod], deps);
        fileDeps.push(deepFileDeps);
      } catch(err) {
        console.error(err);
        console.error(deps.app);
        console.error(mod);
      }
    } else {
      fileDeps.push({
        name: mod,
        modules: []
      });
    }
  }

  return {
    name: moduleName,
    modules: fileDeps
  };
}

async function craftTraceString(trace, depth = "") {
  let str = "";
  str += `${depth}${(depth.length > 0) ? " " : ""}${trace.name}\n`;

  depth += "+";

  for (let mod of trace.modules) {
    str += await craftTraceString(mod, depth);
  }

  return str;
}
