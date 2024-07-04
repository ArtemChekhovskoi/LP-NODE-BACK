import { HealthValue } from "@constants/measurements";
import dayjs, { Dayjs } from "dayjs";

interface HealthValueWithMinMax extends HealthValue {
	minValue: number;
	maxValue: number;
}
const prepareMeasurementsByPeriod = (measurements: HealthValue[], period: number): HealthValueWithMinMax[] => {
	measurements.sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf());

	const { filteredMeasurements } = measurements.reduce(
		(result, measurement) => {
			const measurementTime = dayjs(measurement.startDate);

			// If there's no last measurement or the current measurement is more than the specified period from the last one
			if (!result.lastMeasurementTime || measurementTime.diff(result.lastMeasurementTime, "minutes") >= period) {
				const measurementDuration = dayjs(measurement.endDate).diff(measurementTime, "minutes");
				const periodsCount = Math.floor(measurementDuration / period);
				const recordsArray = Array(periodsCount || 1).fill({
					startDate: measurementTime.toDate(),
					endDate: measurementTime.add(period, "minutes").toDate(),
					value: measurement.value,
					minValue: measurement.value,
					maxValue: measurement.value,
					sourceName: measurement.sourceName,
				});
				console.log(recordsArray);
				result.filteredMeasurements.push(...recordsArray);
				result.lastMeasurementTime = measurementTime;
				return result;
			}

			if (!result.filteredMeasurements.length) {
				result.filteredMeasurements.push({
					...measurement,
					minValue: measurement.value,
					maxValue: measurement.value,
				});
				return result;
			}

			const lastIndex = result.filteredMeasurements.length - 1;
			result.filteredMeasurements[lastIndex] = {
				...result.filteredMeasurements[lastIndex],
				value: Math.floor((result.filteredMeasurements[lastIndex].value + measurement.value) / 2),
				maxValue: Math.max(result.filteredMeasurements[lastIndex].maxValue, measurement.value),
				minValue: Math.min(result.filteredMeasurements[lastIndex].minValue, measurement.value),
			};
			return result;
		},
		{ filteredMeasurements: [] as HealthValueWithMinMax[], lastMeasurementTime: null as Dayjs | null }
	);

	return filteredMeasurements;
};

export default prepareMeasurementsByPeriod;
