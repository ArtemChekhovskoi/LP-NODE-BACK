import { HealthValue } from "@constants/measurements";

const reduceMeasurementBySourceName = (measurements: HealthValue[]): HealthValue[] => {
	const measurementsReducedBySourceName = measurements.reduce(
		(acc, curr) => {
			const sourceName = curr.sourceName || "Apple Health";
			if (!acc[sourceName]) {
				acc[sourceName] = [];
			}
			acc[sourceName].push(curr);
			return acc;
		},
		{} as { [key: string]: HealthValue[] }
	);
	const measurementsWithBiggestLength = Object.values(measurementsReducedBySourceName).reduce((acc, curr) => {
		return acc.length > curr.length ? acc : curr;
	}, [] as HealthValue[]);
	return measurementsWithBiggestLength;
};

export default reduceMeasurementBySourceName;
