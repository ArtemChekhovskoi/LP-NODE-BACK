import getStartOfDay from "@helpers/getStartOfTheDay";
import { ISleepSample } from "@controllers/measurements/appleHealth/heplers/saveAppleHealthSleep";
import dayjs from "dayjs";

interface SleepDuration {
	duration: number;
}

const DAILY_CUTOFF_HOURS = 20;
const SLEEP_VALUES_TO_SUM = [1, 3, 4, 5];
const sumDailySleep = (measurements: ISleepSample[]): { [key: string]: SleepDuration } => {
	const sleepArraySorted = measurements
		.filter((measurement) => SLEEP_VALUES_TO_SUM.includes(measurement.value))
		.sort((a, b) => {
			return dayjs(a.startDate).isBefore(dayjs(b.startDate)) ? -1 : 1;
		});
	const resultsObj = sleepArraySorted.reduce(
		(acc, measurement) => {
			const isIncludedToNextDay =
				dayjs(measurement.startDate).utc().hour() > DAILY_CUTOFF_HOURS ||
				dayjs(measurement.endDate).utc().isAfter(dayjs(measurement.startDate).utc(), "day");
			const sleepDuration = dayjs(measurement.endDate).diff(measurement.startDate, "second");
			let date = getStartOfDay(measurement.startDate).toISOString();
			if (isIncludedToNextDay) {
				date = dayjs(date).add(1, "day").toISOString();
			}
			if (!acc[date]) {
				acc[date] = {
					duration: sleepDuration,
					startDate: measurement.startDate,
					endDate: measurement.endDate,
				};
			} else {
				if (
					dayjs(acc[date].endDate).isAfter(dayjs(measurement.startDate)) &&
					(dayjs(measurement.endDate).isAfter(dayjs(acc[date].endDate)) ||
						dayjs(measurement.endDate).isSame(dayjs(acc[date].endDate)))
				) {
					const periodDuration = dayjs(measurement.endDate).diff(acc[date].endDate, "second");
					acc[date].duration += periodDuration;
					acc[date].endDate = measurement.endDate;
					acc[date].startDate = measurement.startDate;
					return acc;
				}
				if (!dayjs(measurement.endDate).isBefore(dayjs(acc[date].endDate))) {
					acc[date].duration += sleepDuration;
					acc[date].endDate = measurement.endDate;
					acc[date].startDate = measurement.startDate;
				}
			}
			return acc;
		},
		{} as { [date: string]: { startDate: Date | string; endDate: Date | string; duration: number } }
	);
	const returnObjInHours = Object.entries(resultsObj).reduce(
		(acc, [date, measurement]) => {
			acc[date] = {
				duration: +(measurement.duration / 3600).toFixed(2),
			};
			return acc;
		},
		{} as { [date: string]: SleepDuration }
	);
	return returnObjInHours;
};

export default sumDailySleep;
