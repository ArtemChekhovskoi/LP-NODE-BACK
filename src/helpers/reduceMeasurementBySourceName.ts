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
	console.log(JSON.stringify(measurementsReducedBySourceName));
	const measurementsWithBiggestLength = Object.values(measurementsReducedBySourceName).reduce((acc, curr) => {
		console.log("acc.length", acc.length, "curr.length", curr.length);
		return acc.length > curr.length ? acc : curr;
	}, [] as HealthValueWithDate[]);
	console.log(JSON.stringify(measurementsWithBiggestLength));
	return measurementsWithBiggestLength;
};

export default reduceMeasurementBySourceName;
