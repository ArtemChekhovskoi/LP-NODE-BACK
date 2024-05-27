import Redis from "ioredis";
import config from "@config/index";
import { logger } from "../logger";

const redisGame = new Redis(config.redis);

redisGame.on("error", (err: string) => {
	logger.error(`Error redis ${err}`);
});

redisGame.on("connect", (err: string) => {
	if (!err) {
		logger.info("Redis Connected");
	}
});

export { redisGame };
