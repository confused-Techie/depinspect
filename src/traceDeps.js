const path = require("path");

// ANSI symbols taken from:
// https://github.com/yangshun/tree-node-cli/tree/master
const SYMBOLS_ANSI = {
  BRANCH: '├── ',
  EMPTY: '',
  INDENT: '    ',
  LAST_BRANCH: '└── ',
  VERTICAL: '│   ',
};

// ANSI Color Codes taken from:
// https://stackoverflow.com/a/5762502
const ANSI_CODES = {
  RESET: "\u001B[0m",
  BLACK: "\u001B[30m",
  RED: "\u001B[31m",
  GREEN: "\u001B[32m",
  YELLOW: "\u001B[33m",
  BLUE: "\u001B[34m",
  PURPLE: "\u001B[35m",
  CYAN: "\u001B[36m",
  WHITE: "\u001B[37m"
};

// We use this to track uniqueness of the deps added.
// This avoids a situation where two modules require each other,
// and avoids them adding to the tree infinityly
const depListing = [];

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

let idx = 0;

async function traceFileDeps(moduleName, dep, deps) {
  idx = idx + 1;
  console.log(`Dep: ${idx}`);
  console.log(dep);
  let fileDeps = [];

  let modIterator = dep.nodes.entries();

  if (idx > 5000) {
    // This number is largly random.
    // But when scanning pulsar it will overflow our buffer in the millions of
    // deps down.
    return {
      name: moduleName, kind: dep.kind, modules: [], truncated: true
    };
  }

  if (depListing.includes(moduleName)) {
    // This module has already been included elsewhere
    return {
      name: `${moduleName}: Already listed in tree`, kind: dep.kind, modules: []
    };
  } else {
    depListing.push(moduleName);
  }

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
        kind: modEntry.kind,
        modules: []
      });
    }
  }

  return {
    name: moduleName,
    kind: dep.kind,
    modules: fileDeps
  };
}

async function craftTraceString(trace, depth = 0, finalEntry = false) {
  let str = "";
  let char;

  if (depth === 0) {
    char = SYMBOLS_ANSI.EMPTY;
  } else if (depth === 1) {
    if (finalEntry) {
      char = SYMBOLS_ANSI.LAST_BRANCH;
    } else {
      char = SYMBOLS_ANSI.BRANCH;
    }
  } else if (depth > 1) {
    char = "";
    for (let i = 0; i < depth - 1; i++) {
      char += SYMBOLS_ANSI.VERTICAL;
    }
    if (finalEntry) {
      char += SYMBOLS_ANSI.LAST_BRANCH;
    } else {
      char += SYMBOLS_ANSI.BRANCH;
    }
  }

  let colorCode;

  if (trace.kind === "file") {
    colorCode = ANSI_CODES.CYAN;
  } else if (trace.kind === "builtin") {
    colorCode = ANSI_CODES.YELLOW;
  } else if (trace.kind === "dependency") {
    colorCode = ANSI_CODES.RED;
  } else {
    colorCode = "";
  }

  str += `${char}${colorCode}${trace.name}${ANSI_CODES.RESET}\n`;

  depth = depth + 1;

  if (trace.modules.length === 0 && trace.truncated) {
    // If we find a truncated module, make this obvious by using '...' as
    // the module name, and set it to the final entry
    str += await craftTraceString(
      {
        name: "...",
        modules: []
      },
      depth,
      true
    );
  }

  for (let [idx, mod] of trace.modules.entries()) {
    let final = (idx === trace.modules.length - 1);
    str += await craftTraceString(mod, depth, final);
  }

  return str;
}
