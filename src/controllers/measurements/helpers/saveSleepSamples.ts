import getStartOfDay from "@helpers/getStartOfTheDay";
import { UsersDailySleep } from "@models/users_daily_sleep";
import { Types } from "mongoose";
import { MEASUREMENT_CODES } from "@constants/measurements";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import dayjs from "dayjs";

const { ObjectId } = Types;

type SleepType = "ASLEEP" | "INBED" | "AWAKE";
interface ISleepSample {
	startDate: Date;
	endDate: Date;
	value: SleepType;
	sourceName: string;
}

const getSleepInfo = (sleepStartDate: Date, sleepEndDate: Date) => {
	const startDate = dayjs(sleepStartDate);
	const endDate = dayjs(sleepEndDate);
	const cutoffHour = 5;

	const assignDate = startDate.hour() < cutoffHour ? startDate : startDate.add(1, "day");
	const startOfDay = getStartOfDay(assignDate.toISOString());
	const durationMinutes = endDate.diff(startDate, "minutes");

	return { startOfDay, durationMinutes };
};

const saveSleepSamples = async (samples: ISleepSample[], usersID: string) => {
	// TODO: make cutoff hours to properly save date
	const asleepTimeWithDay = samples
		.filter((sample) => sample.value === "ASLEEP")
		.map((sample) => getSleepInfo(sample.startDate, sample.endDate));
	const sleepMeasurementsBulkWrite = asleepTimeWithDay.map((sample) => {
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
					date: sample.startOfDay,
					measurementCode: MEASUREMENT_CODES.SLEEP,
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
	const inBedTime = samples
		.filter((sample) => sample.value === "INBED")
		.reduce((acc, curr) => acc + new Date(curr.endDate).getTime() - new Date(curr.startDate).getTime(), 0);
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
