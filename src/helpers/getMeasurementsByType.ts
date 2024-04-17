import { ACTIVE_MEASUREMENTS } from "@constants/measurements";
import { UsersDailyMeasurementsSum } from "@models/users_daily_measurements_sum";
import { UsersDailyHeartRate } from "@models/users_daily_heart_rate";
import { UsersWeight } from "@models/users_weight";
import { UsersDailyReflections } from "@models/users_daily_reflections";

type DailySumKeys = "dailySteps" | "dailyDistance" | "sleepDuration" | "dailyActivityDuration" | "dailyCaloriesBurned";
interface IReturnValue {
	value: number | null;
	date: Date;
}
interface IHeartRateReturnValue {
	heartRate?: {
		avg: number;
		max: number;
		min: number;
	};
	date: Date;
}

interface IDailyReflectionsReturnValue {
	sleepQuality?: number | null;
	activityFeeling?: number | null;
	date: Date;
}
interface AvgHeartRateReturn {
	[ACTIVE_MEASUREMENTS.AVG_HEART_RATE]: IReturnValue[];
	[ACTIVE_MEASUREMENTS.MAX_HEART_RATE]: IReturnValue[];
	[ACTIVE_MEASUREMENTS.MIN_HEART_RATE]: IReturnValue[];
}
interface GetHeightReturn {
	[ACTIVE_MEASUREMENTS.HEIGHT]: IReturnValue[];
}
interface GetWeightReturn {
	[ACTIVE_MEASUREMENTS.WEIGHT]: IReturnValue[];
}
interface DailyReflectionsReturn {
	[ACTIVE_MEASUREMENTS.DAILY_SLEEP_QUALITY]: IReturnValue[];
	[ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_FEELING]: IReturnValue[];
}

type GetMeasurementFromDailySumReturn = Partial<Record<DailySumKeys, IReturnValue[]>>;

const prepareMeasurementDataForReturn = (dates: Date[], measurementData: IReturnValue[]) => {
	return dates.map((date) => {
		const foundValue = measurementData.find((item) => item.date.getTime() === date.getTime());
		return foundValue || { value: 0, date };
	});
};

const prepareHeartMeasurementToReturn = (dates: Date[], measurementData: IHeartRateReturnValue[], type: "avg" | "min" | "max" = "avg") => {
	return dates.map((date) => {
		const foundValue = measurementData.find((item) => item.date.getTime() === date.getTime());
		return foundValue?.heartRate ? { date, value: foundValue?.heartRate[type] || 0 } : { value: 0, date };
	});
};

const prepareReflectionsToReturn = (
	dates: Date[],
	measurementData: IDailyReflectionsReturnValue[],
	key: "sleepQuality" | "activityFeeling"
) => {
	return dates.map((date) => {
		const foundValue = measurementData.find((item) => item.date.getTime() === date.getTime());
		if (!foundValue) return { value: 0, date };
		return foundValue[key] ? { date, value: foundValue[key] || 0 } : { value: 0, date };
	});
};
const getDailyHeartRateByDates = async (dates: Date[], usersID: string): Promise<AvgHeartRateReturn> => {
	const dailyHeartRate = await UsersDailyHeartRate.find(
		{
			usersID,
			date: { $in: dates },
		},
		{ heartRate: true, date: true, _id: false }
	)
		.sort({ date: -1 })
		.lean();

	return {
		[ACTIVE_MEASUREMENTS.AVG_HEART_RATE]: prepareHeartMeasurementToReturn(dates, dailyHeartRate, "avg"),
		[ACTIVE_MEASUREMENTS.MAX_HEART_RATE]: prepareHeartMeasurementToReturn(dates, dailyHeartRate, "max"),
		[ACTIVE_MEASUREMENTS.MIN_HEART_RATE]: prepareHeartMeasurementToReturn(dates, dailyHeartRate, "min"),
	};
};

const getWeightByDates = async (dates: Date[], usersID: string): Promise<GetWeightReturn> => {
	const dailyWeight = await UsersWeight.find(
		{
			$or: [
				{
					usersID,
					date: { $in: dates },
				},
				{ usersID },
			],
		},
		{ value: true, date: true, _id: false }
	)
		.sort({ date: -1 })
		.lean();
	const weightWithDates = dailyWeight.map((item) => ({ ...item, date: item.date || new Date() }));
	return {
		[ACTIVE_MEASUREMENTS.WEIGHT]: prepareMeasurementDataForReturn(dates, weightWithDates),
	};
};

const getHeightByDates = async (dates: Date[], usersID: string): Promise<GetHeightReturn> => {
	const dailyHeight = await UsersWeight.find(
		{
			$or: [
				{
					usersID,
					date: { $in: dates },
				},
				{ usersID },
			],
		},
		{ value: true, date: true, _id: false }
	)
		.sort({ date: -1 })
		.lean();
	const heightWithDates = dailyHeight.map((item) => ({ ...item, date: item.date || new Date() }));
	return {
		[ACTIVE_MEASUREMENTS.HEIGHT]: prepareMeasurementDataForReturn(dates, heightWithDates),
	};
};

const getMeasurementFromDailySum = async (
	dates: Date[],
	usersID: string,
	measurementCode: DailySumKeys
): Promise<GetMeasurementFromDailySumReturn> => {
	const dailySum = await UsersDailyMeasurementsSum.find(
		{
			measurementCode,
			usersID,
			date: { $in: dates },
		},
		{ value: true, date: true, _id: false }
	)
		.sort({ date: -1 })
		.lean();

	return {
		[measurementCode]: prepareMeasurementDataForReturn(dates, dailySum),
	};
};

const getDailyReflections = async (dates: Date[], usersID: string): Promise<DailyReflectionsReturn> => {
	const reflectionsByDates = await UsersDailyReflections.find({
		usersID,
		date: { $in: dates },
	}).lean();
	return {
		[ACTIVE_MEASUREMENTS.DAILY_SLEEP_QUALITY]: prepareReflectionsToReturn(dates, reflectionsByDates, "sleepQuality"),
		[ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_FEELING]: prepareReflectionsToReturn(dates, reflectionsByDates, "activityFeeling"),
	};
};

export { getDailyHeartRateByDates, getWeightByDates, getHeightByDates, getMeasurementFromDailySum, getDailyReflections };
