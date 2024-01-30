import { HealthValue } from "@constants/measurements";
import dayjs, { Dayjs } from "dayjs";

const filterMeasurementsByPeriod = (measurements: HealthValue[], periodInMinutes: number = 30) => {
	measurements.sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf());

	const { filteredMeasurements } = measurements.reduce(
		(result, measurement) => {
			const measurementTime = dayjs(measurement.startDate);

			// If there's no last measurement or the current measurement is more than the specified period from the last one
			if (!result.lastMeasurementTime || measurementTime.diff(result.lastMeasurementTime, "minutes") >= periodInMinutes) {
				result.filteredMeasurements.push(measurement);
				result.lastMeasurementTime = measurementTime;
			}

			return result;
		},
		{ filteredMeasurements: [] as HealthValue[], lastMeasurementTime: null as Dayjs | null }
	);

	return filteredMeasurements;
};

export default filterMeasurementsByPeriod;
