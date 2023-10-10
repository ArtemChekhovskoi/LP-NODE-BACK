import local from "./local.json";

type Env = "local";
const env: Env = process.env.NODE_ENV as Env;

const config = {
  local,
};

export default config[env];
