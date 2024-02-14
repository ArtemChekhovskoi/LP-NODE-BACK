import local from "./local.json";
import development from "./development.json";
import production from "./production.json";

type Env = "local" | "development" | "production";
const env: Env = process.env.NODE_ENV as Env;

const config = {
	local,
	development,
	production,
};

export default config[env];
