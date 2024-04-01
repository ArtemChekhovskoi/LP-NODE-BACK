import dayjs from "dayjs";

interface MeasurementWithDates {
	startDate: Date;
	endDate: Date;
}

const MINUTES_IN_DAY = 1440;

const calculateMeasurementPercentages = (measurement: MeasurementWithDates, startOfTheDay: Date) => {
	if (dayjs(measurement.startDate).isBefore(dayjs(startOfTheDay)) && dayjs(measurement.endDate).isBefore(dayjs(startOfTheDay))) {
		return {
			startPercentage: 0,
			endPercentage: 0,
		};
	}
	const sleepStart = dayjs(measurement.startDate).isBefore(startOfTheDay) ? dayjs(startOfTheDay) : dayjs(measurement.startDate);

	const sleepDuration = dayjs(measurement.endDate).diff(sleepStart, "minute");
	const sleepStartPercentage = (dayjs(sleepStart).diff(startOfTheDay, "minute") / MINUTES_IN_DAY).toFixed(2);
	let sleepEndPercentage = +(+sleepStartPercentage + sleepDuration / MINUTES_IN_DAY).toFixed(2);
	if (sleepEndPercentage > 1) {
		sleepEndPercentage = 1.0;
	}
	return {
		startPercentage: +sleepStartPercentage,
		endPercentage: +sleepEndPercentage,
	};
};

export default calculateMeasurementPercentages;
