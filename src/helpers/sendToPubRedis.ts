import { logger } from "@logger/index";

import { REDIS_KEYS } from "@constants/redisKeys";

import { redisGame } from "./redisConnection";

interface IHealthSyncStatus {
	usersID: string;
	syncPercentage: number;
	statusCode: number;
}
const sendHealthSyncStatus = async (data: IHealthSyncStatus) => {
	try {
		await redisGame.publish(REDIS_KEYS.HEALTH_DATA_SYNC_UPDATED, JSON.stringify(data));
	} catch (e) {
		logger.error(`Error at sendBusterStatus: ${e}`, e);
	}
};

export { sendHealthSyncStatus };
