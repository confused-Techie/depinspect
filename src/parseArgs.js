const process = require("process");

module.exports =
function parseArgs(args) {
  let opts = {
    inspect: false,
    directory: process.cwd()
  };

  for (let i = 0; i < args.length; i++) {
    let keyValue = args[i].split("=");

    if (args[i] === "--inspect") {
      opts.inspect = true;
    } else if (keyValue[0] === "--directory") {
      opts.directory = keyValue[1];
    } else if (args[i] === "--verbose" || args[i] === "-v") {
      opts.verbose = true;
    } else if (args[i] === "--write_node") {
      opts.writeNode = true;
    } else if (args[i] === "--trace") {
      opts.trace = true;
    } else if (keyValue[0] === "--startTrace") {
      opts.startTrace = keyValue[1];
    } else if (keyValue[0] === "--output") {
      opts.output = keyValue[1];
    }
  }

  return opts;
}
