import local from "./local.json";
import development from "./development.json";

type Env = "local" | "development";
const env: Env = process.env.NODE_ENV as Env;

const config = {
  local,
  development,
};

export default config[env];
