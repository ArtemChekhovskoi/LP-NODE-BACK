import { HealthValue } from "@constants/measurements";
import getStartOfDay from "@helpers/getStartOfTheDay";
import dayjs from "dayjs";

interface DailyTimeWithDate {
	value: number;
	date: string;
}
const sumMeasurementDailyTime = (measurements: HealthValue[]): DailyTimeWithDate[] => {
	const resultsObj = measurements.reduce(
		(acc, measurement) => {
			const date = getStartOfDay(measurement.startDate).toISOString();
			if (!acc[date]) {
				acc[date] = {
					value: dayjs(measurement.endDate).diff(measurement.startDate, "minute"),
					date,
				};
			} else {
				acc[date].value += dayjs(measurement.endDate).diff(measurement.startDate, "minute");
			}
			return acc;
		},
		{} as { [date: string]: DailyTimeWithDate }
	);
	return Object.values(resultsObj);
};

export default sumMeasurementDailyTime;
