import { HealthValue } from "@constants/measurements";

const calculateAverageMeasurement = (measurements: HealthValue[]) => {
	const numberOfMeasurements = measurements.length;
	const sumOfMeasurements = measurements.reduce((acc, measurement) => acc + measurement.value, 0);
	return {
		value: sumOfMeasurements / numberOfMeasurements,
	};
};

export { calculateAverageMeasurement };
