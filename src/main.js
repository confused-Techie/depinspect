const parseArgs = require("./parseArgs.js");
const collectDeps = require("./collectDeps.js");

module.exports =
async function run(args) {
  const opts = parseArgs(args);

  if (opts.inspect) {
    // We are intending to inspect the files we have been given
    let deps = await collectDeps(opts);
    console.log(deps);
  } else {
    console.log("Nothing to do... Exiting");
    process.exit(0);
  }
}
