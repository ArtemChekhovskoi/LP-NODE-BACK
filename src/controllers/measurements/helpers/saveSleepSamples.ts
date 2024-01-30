import getStartOfDay from "@helpers/getStartOfTheDay";
import { UsersDailySleep } from "@models/users_daily_sleep";
import { Types } from "mongoose";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { IMeasurementsConfig } from "@controllers/measurements/helpers/createDatesObject";

dayjs.extend(duration);

const { ObjectId } = Types;

interface ISleepSample {
	startDate: string | Date;
	endDate: string | Date;
	value: string;
	sourceName: string;
}

const TRACKED_SLEEP_TYPES = ["ASLEEP", "INBED"];

const sumSleepByDate = (measurements: ISleepSample[]): { date: string; durationMinutes: number }[] => {
	const result: { [date: string]: number } = measurements.reduce(
		(acc, measurement) => {
			const measurementStartDate = dayjs(measurement.startDate);
			const measurementEndDate = dayjs(measurement.endDate);
			const dateKey = getStartOfDay(measurementStartDate.add(4, "hours").toDate()).toISOString();

			if (acc[dateKey] === undefined) {
				acc[dateKey] = 0;
			}

			// Handle case where user sleeps with no awakening (value="ASLEEP")
			if (measurement.value === "ASLEEP" && measurementEndDate.isAfter(measurementStartDate)) {
				const periodDuration = dayjs.duration(measurementEndDate.diff(measurementStartDate));
				acc[dateKey] += periodDuration.asMinutes();
				console.log(periodDuration.asMinutes());
			} else {
				// Handle other values (CORE, AWAKE, DEEP, etc.)
				acc[dateKey] += 1; // You can modify this based on your requirements
			}

			return acc;
		},
		{} as { [date: string]: number }
	);

	// Convert the result into an array of objects
	const resultArray = Object.entries(result).map(([date, durationMinutes]) => ({ date, durationMinutes }));

	return resultArray;
};

const saveSleepSamples = async (samples: ISleepSample[], usersID: string, measurementConfig: IMeasurementsConfig) => {
	const trackedSleepMeasurements = samples.filter((sample) => TRACKED_SLEEP_TYPES.includes(sample.value));
	const preparedSamples = sumSleepByDate(trackedSleepMeasurements);

	console.log("preparedSamples", preparedSamples);
	const sleepMeasurementsBulkWrite = preparedSamples.map((sample) => {
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
					date: new Date(sample.date),
					measurementCode: measurementConfig.code,
				},
				update: {
					$inc: {
						value: +sample.durationMinutes.toFixed(measurementConfig.precision || 2),
					},
					$set: {
						lastUpdated: new Date(),
					},
				},
				upsert: true,
			},
		};
	});
	const usersDailySleepArray = trackedSleepMeasurements.map((sample) => {
		const { startDate, endDate, value, sourceName } = sample;
		const date = getStartOfDay(sample.startDate);
		return {
			updateOne: {
				filter: {
					startDate: new Date(startDate),
					endDate: new Date(endDate),
					value,
					sourceName,
					usersID: new ObjectId(usersID),
					date,
				},
				update: {
					lastUpdated: new Date(),
				},
				upsert: true,
			},
		};
	});

	await Promise.all([UsersDailySleep.bulkWrite(usersDailySleepArray), UsersDailyMeasurements.bulkWrite(sleepMeasurementsBulkWrite)]);
};

export { saveSleepSamples, ISleepSample };
