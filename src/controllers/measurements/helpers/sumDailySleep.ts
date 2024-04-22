import getStartOfDay from "@helpers/getStartOfTheDay";
import { ISleepSample } from "@controllers/measurements/appleHealth/heplers/saveAppleHealthSleep";
import dayjs from "dayjs";

interface SleepDuration {
	duration: number;
}

const DAILY_CUTOFF_HOURS = 20;
const SLEEP_VALUES_TO_SUM = [1, 2, 3, 4, 5];
const sumDailySleep = (measurements: ISleepSample[]): { [key: string]: SleepDuration } => {
	const resultsObj = measurements.reduce(
		(acc, measurement) => {
			// TODO delete this line
			if (measurement.sourceName === "Tetiana’s iPhone") {
				return acc;
			}
			const isIncludedToSum = SLEEP_VALUES_TO_SUM.includes(measurement.value);
			if (!isIncludedToSum) {
				return acc;
			}
			const isIncludedToNextDay =
				dayjs(measurement.startDate).utc().hour() > DAILY_CUTOFF_HOURS ||
				dayjs(measurement.endDate).utc().isAfter(dayjs(measurement.startDate).utc(), "day");
			const sleepDuration = dayjs(measurement.endDate).diff(measurement.startDate, "minute");
			let date = getStartOfDay(measurement.startDate).toISOString();
			if (isIncludedToNextDay) {
				date = dayjs(date).add(1, "day").toISOString();
			}
			if (!acc[date]) {
				acc[date] = {
					duration: sleepDuration,
				};
			} else {
				acc[date].duration += sleepDuration;
			}
			return acc;
		},
		{} as { [date: string]: SleepDuration }
	);
	return resultsObj;
};

export default sumDailySleep;
