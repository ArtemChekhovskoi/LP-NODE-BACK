import { Model, Types } from "mongoose";
import { Users } from "@models/users";
import { IPreparedMeasurementsByCollectionName } from "@controllers/measurements/appleHealth/postSyncAppleHealth";
import { UsersActivity } from "@models/users_activity";
import { UsersDailyMeasurementsSum } from "@models/users_daily_measurements_sum";
import { UsersHeartRate } from "@models/users_heart_rate";
import { UsersDailyHeartRate } from "@models/users_daily_heart_rate";
import { UsersHeight } from "@models/users_height";
import { UsersWeight } from "@models/users_weight";
import { UsersSleep } from "@models/users_sleep";
import { UsersSteps } from "@models/users_steps";
import { UsersWalkingRunningDistance } from "@models/users_walking_running_distance";

import { logger } from "@logger/index";
import { sendHealthSyncStatus } from "@helpers/sendToPubRedis";

const { ObjectId } = Types;

const MODELS_BY_COLLECTION_NAME = {
	[UsersActivity.collection.name]: UsersActivity,
	[UsersDailyMeasurementsSum.collection.name]: UsersDailyMeasurementsSum,
	[UsersHeartRate.collection.name]: UsersHeartRate,
	[UsersDailyHeartRate.collection.name]: UsersDailyHeartRate,
	[UsersHeight.collection.name]: UsersHeight,
	[UsersWeight.collection.name]: UsersWeight,
	[UsersSleep.collection.name]: UsersSleep,
	[UsersSteps.collection.name]: UsersSteps,
	[UsersWalkingRunningDistance.collection.name]: UsersWalkingRunningDistance,
};

const MONGO_BULK_WRITE_LIMIT = 1000;

const saveSyncData = async (
	preparedMeasurementsByCollectionName: IPreparedMeasurementsByCollectionName,
	usersID: string,
	syncDatePrepared: Date,
	totalMeasurementsAmount: number
) => {
	const syncStartTime = process.hrtime();
	let measurementsSynced = 0;

	try {
		for (const [collectionName, preparedMeasurements] of Object.entries(preparedMeasurementsByCollectionName)) {
			const model = MODELS_BY_COLLECTION_NAME[collectionName] as Model<any>;
			if (!model) {
				throw new Error(`Model not found for ${collectionName}`);
			}

			for (let i = 0; i < preparedMeasurements.length; i += MONGO_BULK_WRITE_LIMIT) {
				const bulkWriteOperations = preparedMeasurements.slice(i, i + MONGO_BULK_WRITE_LIMIT);
				await model.bulkWrite(bulkWriteOperations);

				measurementsSynced += bulkWriteOperations.length;
				logger.info(`Sync percentage: ${Math.round((measurementsSynced / totalMeasurementsAmount) * 100)}%`);
			}

			await sendHealthSyncStatus({
				usersID,
				syncPercentage: +(measurementsSynced / totalMeasurementsAmount).toFixed(2),
				statusCode: 1,
			});
		}
		await Users.updateOne({ _id: new ObjectId(usersID) }, { lastSyncDate: syncDatePrepared, lastUpdated: new Date() });
		await sendHealthSyncStatus({
			usersID,
			syncPercentage: +(measurementsSynced / totalMeasurementsAmount).toFixed(2),
			statusCode: 3,
		});
	} catch (e) {
		logger.error("Error while saving sync data", e);
		await sendHealthSyncStatus({
			usersID,
			syncPercentage: +(measurementsSynced / totalMeasurementsAmount).toFixed(2),
			statusCode: 2,
		});
		throw e;
	} finally {
		const syncEndTime = process.hrtime(syncStartTime);
		logger.info(`Sync data saved in ${syncEndTime[0]}s ${syncEndTime[1] / 1000000}ms`);
	}
};

export default saveSyncData;
