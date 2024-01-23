import getStartOfDay from "@helpers/getStartOfTheDay";
import { UsersDailySleep } from "@models/users_daily_sleep";
import { Types } from "mongoose";
import { MEASUREMENT_CODES } from "@constants/measurements";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";

const { ObjectId } = Types;

type SleepType = "ASLEEP" | "INBED" | "AWAKE";
interface ISleepSample {
	startDate: Date;
	endDate: Date;
	value: SleepType;
	sourceName: string;
}

const saveSleepSamples = async (samples: ISleepSample[], usersID: string) => {
	// TODO: make cutoff hours to properly save date
	const asleepTime = samples.filter((sample) => sample.value === "ASLEEP").reduce((acc, curr) => acc + curr.endDate.getTime() - curr.startDate.getTime(), 0);
	const inBedTime = samples.filter((sample) => sample.value === "INBED").reduce((acc, curr) => acc + curr.endDate.getTime() - curr.startDate.getTime(), 0);
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

	await Promise.all([
		UsersDailySleep.bulkWrite(usersDailySleepArray),
		UsersDailyMeasurements.updateOne(
			{
				usersID: new ObjectId(usersID),
				date: getStartOfDay(samples[0].startDate),
				measurementCode: MEASUREMENT_CODES.SLEEP,
			},
			{
				lastUpdated: new Date(),
				value: asleepTime,
				source: samples[0].sourceName,
			},
			{ upsert: true }
		),
	]);
};

export { saveSleepSamples, SleepType, ISleepSample };
