import { MongoConnection } from "@helpers/mongoConnection";
import { logger } from "../logger";

const mongoConfig = {
  uri: process.env.MONGO_URI,
  options: {
    authSource: "admin",
    auth: {
      username: process.env.MONGO_USER,
      password: process.env.MONGO_PASSWORD,
    },
  },
};
const mongoMain = new MongoConnection(logger, mongoConfig);

export { mongoMain };
