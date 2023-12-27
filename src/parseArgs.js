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
    }
  }

  return opts;
}
