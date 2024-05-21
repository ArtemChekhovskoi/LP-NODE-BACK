import { HealthValue } from "@constants/measurements";
import getStartOfDay from "@helpers/getStartOfTheDay";

export interface HealthValueWithDate extends HealthValue {
	date: string;
}
const sumMeasurementsByDay = (measurements: HealthValue[]): HealthValueWithDate[] => {
	const resultsObj = measurements.reduce(
		(acc, measurement) => {
			const date = getStartOfDay(measurement.startDate).toISOString();
			if (!acc[date]) {
				acc[date] = {
					...measurement,
					date,
					value: measurement.value,
				};
			} else {
				acc[date].value += measurement.value;
			}
			return acc;
		},
		{} as { [date: string]: HealthValueWithDate }
	);
	return Object.values(resultsObj);
};

export default sumMeasurementsByDay;
