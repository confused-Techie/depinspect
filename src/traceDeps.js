const path = require("path");

module.exports =
async function traceDeps(opts, deps) {
  // This function can be handed a deps object from `collectDeps`
  // and will use `opts.startTrace` to trace all modules required from that location

  let traceObj = await traceFileDeps(opts.startTrace, deps.app[getModuleNameFromPath(opts.startTrace)], deps);

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
  let fileDeps = [];

  let modIterator = dep.nodes.entries();

  for (const entry of modIterator) {
    let modEntry = entry[0];

    let mod = getModuleNameFromPath(modEntry.module);

    if (deps.app[mod]) {
      let deepFileDeps = await traceFileDeps(mod, deps.app[mod], deps);
      fileDeps.push(deepFileDeps);
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

function getModuleNameFromPath(mod) {
  // The mod string, since it comes from code, may come with some string symbols
  let modString = mod.replace(/"/g, "").replace(/'/g, "");
  return path.parse(modString).base;
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
