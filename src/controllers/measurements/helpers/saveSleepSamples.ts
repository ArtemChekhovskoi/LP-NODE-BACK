import getStartOfDay from "@helpers/getStartOfTheDay";
import { UsersDailySleep } from "@models/users_daily_sleep";
import { ClientSession, Types } from "mongoose";
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

interface ISleepSumAcc {
	date: string;
	source: string;
	duration: number;
}

const TRACKED_SLEEP_TYPES = ["INBED"];

const sumSleepByDate = (measurements: ISleepSample[]): { date: string; durationMinutes: number; source: string }[] => {
	const result: { [date: string]: ISleepSumAcc } = measurements.reduce(
		(acc, measurement) => {
			const measurementStartDate = dayjs(measurement.startDate);
			const measurementEndDate = dayjs(measurement.endDate);
			const dateKey = getStartOfDay(measurementStartDate.add(4, "hours").toDate()).toISOString();
			const { sourceName } = measurement;

			if (acc[`${sourceName}-${dateKey}`] === undefined) {
				acc[`${sourceName}-${dateKey}`] = {
					date: dateKey,
					source: sourceName,
					duration: dayjs.duration(measurementEndDate.diff(measurementStartDate)).asMinutes() || 0,
				};
				return acc;
			}

			acc[`${sourceName}-${dateKey}`].duration += dayjs.duration(measurementEndDate.diff(measurementStartDate)).asMinutes() || 0;
			return acc;
		},
		{} as { [date: string]: ISleepSumAcc }
	);

	console.log(result);
	// Convert the result into an array of objects
	const resultArray = Object.values(result).map((value) => ({
		date: value.date,
		durationMinutes: value.duration,
		source: value.source,
	}));

	return resultArray;
};

const saveSleepSamples = async (
	samples: ISleepSample[],
	usersID: string,
	measurementConfig: IMeasurementsConfig,
	mongoSession: ClientSession
) => {
	const trackedSleepMeasurements = samples.filter((sample) => TRACKED_SLEEP_TYPES.includes(sample.value));
	const preparedSamples = sumSleepByDate(trackedSleepMeasurements);
	const sleepMeasurementsBulkWrite = preparedSamples.map((sample) => {
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
					date: new Date(sample.date),
					measurementCode: measurementConfig.code,
					source: sample.source,
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
					sourceName,
					usersID: new ObjectId(usersID),
					date,
				},
				update: {
					value,
					endDate: new Date(endDate),
					lastUpdated: new Date(),
				},
				upsert: true,
			},
		};
	});

	await UsersDailySleep.bulkWrite(usersDailySleepArray, { session: mongoSession });
	await UsersDailyMeasurements.bulkWrite(sleepMeasurementsBulkWrite, { session: mongoSession });
};

export { saveSleepSamples, ISleepSample };
