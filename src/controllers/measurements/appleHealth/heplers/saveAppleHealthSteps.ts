import { ACTIVE_MEASUREMENTS, HealthValue } from "@constants/measurements";
import { Types } from "mongoose";
import { UsersSteps } from "@models/users_steps";
import sumMeasurementsByDay from "@controllers/measurements/helpers/sumMeasurementsByDay";
import { UsersDailyMeasurementsSum } from "@models/users_daily_measurements_sum";
import dayjs from "dayjs";
import reduceMeasurementBySourceName from "@helpers/reduceMeasurementBySourceName";

const { ObjectId } = Types;

const saveAppleHealthSteps = (steps: HealthValue[], usersID: string, utcOffset: number) => {
	if (!steps || steps.length === 0) {
		throw new Error("No steps data");
	}

	const stepsWithCorrectDates = steps.map((measurement) => {
		return {
			...measurement,
			startDate: dayjs(measurement.startDate).add(utcOffset, "minute").toDate(),
			endDate: dayjs(measurement.endDate).add(utcOffset, "minute").toDate(),
		};
	});

	const stepsByDate = sumMeasurementsByDay(stepsWithCorrectDates);
	const stepsWithBiggestLength = reduceMeasurementBySourceName(stepsByDate);

	const dailyStepsBulkWrite = stepsWithBiggestLength.map((measurement) => {
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
	const stepsBulkWrite = stepsWithCorrectDates.map((measurement) => ({
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

	return [
		{
			data: dailyStepsBulkWrite,
			model: UsersDailyMeasurementsSum.collection.name,
		},
		{
			data: stepsBulkWrite,
			model: UsersSteps.collection.name,
		},
	];
};

export default saveAppleHealthSteps;
