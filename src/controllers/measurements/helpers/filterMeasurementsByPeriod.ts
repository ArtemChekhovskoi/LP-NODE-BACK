import { HealthValue } from "@constants/measurements";
import dayjs, { Dayjs } from "dayjs";

interface HealthValueWithMinMax extends HealthValue {
	minValue: number;
	maxValue: number;
}
const filterMeasurementsByPeriod = (measurements: HealthValue[], periodInMinutes: number = 30) => {
	measurements.sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf());

	const { filteredMeasurements } = measurements.reduce(
		(result, measurement) => {
			const measurementTime = dayjs(measurement.startDate);

			// If there's no last measurement or the current measurement is more than the specified period from the last one
			if (!result.lastMeasurementTime || measurementTime.diff(result.lastMeasurementTime, "minutes") >= periodInMinutes) {
				result.filteredMeasurements.push({
					...measurement,
					minValue: measurement.value,
					maxValue: measurement.value,
				});
				result.lastMeasurementTime = measurementTime;
				return result;
			}

			const lastIndex = result.filteredMeasurements.length - 1;
			result.filteredMeasurements[lastIndex] = {
				...result.filteredMeasurements[lastIndex],
				maxValue: Math.max(result.filteredMeasurements[lastIndex].maxValue, measurement.value),
				minValue: Math.min(result.filteredMeasurements[lastIndex].minValue, measurement.value),
			};
			return result;
		},
		{ filteredMeasurements: [] as HealthValueWithMinMax[], lastMeasurementTime: null as Dayjs | null }
	);

	return filteredMeasurements;
};

export default filterMeasurementsByPeriod;
