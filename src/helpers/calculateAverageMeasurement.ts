import { ReturnedDailyMeasurement } from "@controllers/measurements/getDailyMeasurements";

const calculateAverageMeasurement = (measurements: ReturnedDailyMeasurement[]): ReturnedDailyMeasurement => {
	const numberOfMeasurements = measurements.length;
	const sumOfMeasurements = measurements.reduce((acc, measurement) => acc + measurement.value, 0);
	return {
		...measurements[0],
		value: sumOfMeasurements / numberOfMeasurements,
	};
};

export { calculateAverageMeasurement };
