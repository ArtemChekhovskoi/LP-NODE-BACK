const tsConfigPaths = require("tsconfig-paths");

const baseUrl = "./"; // Either absolute or relative path. If relative it's resolved to current working directory.
const cleanup = tsConfigPaths.register({
  baseUrl,
  paths: {
    "@controllers/*": ["./src/controllers/*"],
    "@models/*": ["./src/models/*"],
    "@routes/*": ["./src/routes/*"],
    "@constants/*": ["./src/constants/*"],
    "@helpers/*": ["./src/helpers/*"],
    "@config/*": ["./config/*"],
    "@logger/*": ["./src/logger/*"],
    "@middlewares/*": ["./src/middlewares/*"],
  },
});

// When path registration is no longer needed
cleanup();
