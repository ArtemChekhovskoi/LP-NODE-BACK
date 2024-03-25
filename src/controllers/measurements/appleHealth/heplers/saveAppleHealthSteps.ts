import { ACTIVE_MEASUREMENTS, HealthValue } from "@constants/measurements";
import { ClientSession, Types } from "mongoose";
import { UsersSteps } from "@models/users_steps";
import sumMeasurementsByDay from "@controllers/measurements/helpers/sumMeasurementsByDay";
import { UsersDailyMeasurementsSum } from "@models/users_daily_measurements_sum";
import sumMeasurementDailyTime from "@controllers/measurements/helpers/sumMeasurementDailyTime";

const { ObjectId } = Types;

const saveAppleHealthSteps = async (steps: HealthValue[], usersID: string, mongoSession: ClientSession) => {
	if (!steps || steps.length === 0) {
		throw new Error("No steps data");
	}

	const stepsByDate = sumMeasurementsByDay(steps);
	const dailyActivityTimeBySteps = sumMeasurementDailyTime(steps);
	const dailyStepsBulkWrite = stepsByDate.map((measurement) => {
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
					date: new Date(measurement.date),
					measurementCode: ACTIVE_MEASUREMENTS.DAILY_STEPS,
				},
				update: {
					$inc: {
						value: measurement.value,
					},
					$set: {
						lastUpdated: new Date(),
					},
				},
				upsert: true,
			},
		};
	});
	const stepsBulkWrite = steps.map((measurement) => ({
		updateOne: {
			filter: {
				usersID: new ObjectId(usersID),
				startDate: new Date(measurement.startDate),
				sourceName: measurement?.sourceName,
			},
			update: {
				$set: {
					endDate: new Date(measurement.endDate),
					value: measurement.value,
					lastUpdated: new Date(),
				},
			},
			upsert: true,
		},
	}));
	const dailyActivityByStepsBulkWrite = dailyActivityTimeBySteps.map((measurement) => {
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
					date: new Date(measurement.date),
					measurementCode: ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_DURATION,
				},
				update: {
					$inc: {
						value: measurement.value,
					},
					$set: {
						lastUpdated: new Date(),
					},
				},
				upsert: true,
			},
		};
	});

	await UsersDailyMeasurementsSum.bulkWrite([...dailyStepsBulkWrite, ...dailyActivityByStepsBulkWrite], { session: mongoSession });
	await UsersSteps.bulkWrite(stepsBulkWrite, { session: mongoSession });

	return true;
};

export default saveAppleHealthSteps;
