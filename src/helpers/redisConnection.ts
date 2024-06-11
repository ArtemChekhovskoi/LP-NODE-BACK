import Redis from "ioredis";
import { logger } from "../logger";

const redisConfig = {
	host: process.env.REDIS_HOST,
	port: parseInt(process.env.REDIS_PORT!, 10),
	password: process.env.REDIS_PASSWORD,
};
const redisGame = new Redis(redisConfig);

redisGame.on("error", (err: string) => {
	logger.error(`Error redis ${err}`);
});

redisGame.on("connect", (err: string) => {
	if (!err) {
		logger.info("Redis Connected");
	}
});

export { redisGame };
