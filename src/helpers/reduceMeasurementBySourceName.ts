import { HealthValueWithDate } from "@controllers/measurements/helpers/sumMeasurementsByDay";

const reduceMeasurementBySourceName = (measurements: HealthValueWithDate[]): HealthValueWithDate[] => {
	const measurementsReducedBySourceName = measurements.reduce(
		(acc, curr) => {
			const sourceName = curr.sourceName || "Apple Health";
			if (!acc[sourceName]) {
				acc[sourceName] = [];
			}
			acc[sourceName].push(curr);
			return acc;
		},
		{} as { [key: string]: HealthValueWithDate[] }
	);
	const measurementsWithBiggestLength = Object.values(measurementsReducedBySourceName).reduce((acc, curr) =>
		acc.length > curr.length ? acc : curr
	);
	return measurementsWithBiggestLength;
};

export default reduceMeasurementBySourceName;
