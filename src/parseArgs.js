const process = require("process");
const path = require("path");

module.exports =
function parseArgs(args) {
  let opts = {
    inspect: false,
    directory: process.cwd(),
    substitutions: {}
  };

  for (let i = 0; i < args.length; i++) {
    let keyValue = args[i].split("=");

    if (args[i] === "--inspect") {
      opts.inspect = true;
    } else if (keyValue[0] === "--directory") {
      opts.directory = keyValue[1];
    } else if (args[i] === "--verbose" || args[i] === "-v") {
      opts.verbose = true;
    } else if (args[i] === "--trace") {
      opts.trace = true;
    } else if (keyValue[0] === "--startTrace") {
      opts.startTrace = keyValue[1];
    } else if (keyValue[0] === "--output") {
      opts.output = keyValue[1];
    }
  }

  // Substitutions would allow the replacement of non-standard require patterns
  // that can't be fully parsed, to ensure they are still calculated correctly
  // There doesn't seem to be anyway to provide such complex data via the CLI
  // So we may need to support local config files for depinsepct
  opts.substitutions = {
    "path.join(resourcePath, 'src', 'main-process', 'start')": path.join("src", "main-process", "start.js")
  };

  return opts;
}
