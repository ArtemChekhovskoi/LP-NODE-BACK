import config from "@config/index";
import { MongoConnection } from "@helpers/mongoConnection";
import { logger } from "../logger";

const mongoConfig = config.mongo.main;
const mongoMain = new MongoConnection(logger, mongoConfig);

export { mongoMain };
