const parseArgs = require("./parseArgs.js");
const collectDeps = require("./collectDeps.js");
const traceDeps = require("./traceDeps.js");
const inspectDeps = require("./inspectDeps.js");
const util = require("node:util");

module.exports =
async function run(args) {
  const opts = parseArgs(args);

  if (opts.verbose) {
    process.VERBOSE = true;
  }
  if (opts.writeNode) {
    process.WRITE_NODE = true;
  }

  let deps = await collectDeps(opts);

  if (opts.inspect) {
    // We are intending to inspect the files we have been given
    let res = await inspectDeps(opts, deps);

    logOutput(res);
    process.exit(0);
  } else if (opts.trace) {
    // Trace the deps from the starting point, which is the file we have been provided
    let res = await traceDeps(opts, deps);

    logOutput(res);
    process.exit(0);
  } else {
    console.log("Nothing to do... Exiting");
    process.exit(0);
  }
}

function logOutput(output) {
  if (typeof output === "string") {
    console.log(output);
  } else if (typeof output === "object") {
    console.log(util.inspect(output, { depth: null }));
  }
}
