import getStartOfDay from "@helpers/getStartOfTheDay";
import { UsersDailySleep } from "@models/users_daily_sleep";
import { Types } from "mongoose";
import { MEASUREMENT_CODES } from "@constants/measurements";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import dayjs from "dayjs";

const { ObjectId } = Types;

type SleepType = "ASLEEP" | "INBED";
interface ISleepSample {
	startDate: Date;
	endDate: Date;
	value: SleepType;
	sourceName: string;
}

const TRACKED_SLEEP_TYPES = ["ASLEEP", "INBED"];

const getSleepInfo = (sleepStartDate: Date, sleepEndDate: Date, value: SleepType) => {
	const startDate = dayjs(sleepStartDate);
	const endDate = dayjs(sleepEndDate);
	const cutoffHour = 5;

	const assignDate = startDate.hour() < cutoffHour ? startDate : startDate.add(1, "day");
	const startOfDay = getStartOfDay(assignDate.toISOString());
	const durationMinutes = endDate.diff(startDate, "minutes");

	return { startOfDay, durationMinutes, code: value === "ASLEEP" ? MEASUREMENT_CODES.SLEEP : MEASUREMENT_CODES.IN_BED };
};

const saveSleepSamples = async (samples: ISleepSample[], usersID: string) => {
	const asleepTimeWithDay = samples
		.filter((sample) => TRACKED_SLEEP_TYPES.includes(sample.value))
		.map((sample) => getSleepInfo(sample.startDate, sample.endDate, sample.value));
	const sleepMeasurementsBulkWrite = asleepTimeWithDay.map((sample) => {
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
					date: sample.startOfDay,
					measurementCode: sample.code,
				},
				update: {
					$inc: {
						value: sample.durationMinutes,
					},
				},
				upsert: true,
			},
		};
	});
	const usersDailySleepArray = samples.map((sample) => {
		const { startDate, endDate, value, sourceName } = sample;
		const date = getStartOfDay(sample.startDate);
		return {
			updateOne: {
				filter: {
					startDate,
					endDate,
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

export { saveSleepSamples, SleepType, ISleepSample };
