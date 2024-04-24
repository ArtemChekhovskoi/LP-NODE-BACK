import { SleepValue } from "@controllers/measurements/getDailyHeartRateDependencies";
import dayjs from "dayjs";

const SLEEP_VALUES_TO_SUM = [0, 1, 2, 3, 4, 5];
const SECONDS_IN_DAY = 1440 * 60;

const calculateSleepPercentages = (sleepData: SleepValue[], startOfTheDay: Date) => {
	const sleepArraySorted = sleepData
		.filter((measurement) => SLEEP_VALUES_TO_SUM.includes(measurement.value))
		.sort((a, b) => {
			return dayjs(a.startDate).isBefore(dayjs(b.startDate)) ? -1 : 1;
		});
	const resultsObj = sleepArraySorted.reduce(
		(acc, measurement) => {
			const lastPeriod = acc[acc.length - 1];

			if (dayjs(measurement.startDate).isBefore(dayjs(startOfTheDay)) && dayjs(measurement.endDate).isBefore(dayjs(startOfTheDay))) {
				return [
					{
						startPercentage: 0,
						endPercentage: 0,
						startDate: measurement.startDate,
						endDate: measurement.endDate,
					},
				];
			}

			const sleepDuration = dayjs(measurement.endDate).diff(measurement.startDate, "seconds");
			if (!acc.length || !lastPeriod || lastPeriod?.endPercentage === 0) {
				const sleepStart = dayjs(measurement.startDate).isBefore(startOfTheDay)
					? dayjs(startOfTheDay)
					: dayjs(measurement.startDate);
				const sleepStartPercentage = +(dayjs(sleepStart).diff(startOfTheDay, "seconds") / SECONDS_IN_DAY).toFixed(4);
				const sleepEndPercentage = +(+sleepStartPercentage + sleepDuration / SECONDS_IN_DAY).toFixed(4);

				if (sleepEndPercentage === sleepStartPercentage) {
					return acc;
				}
				acc.push({
					startPercentage: sleepStartPercentage,
					endPercentage: sleepEndPercentage,
					startDate: measurement.startDate,
					endDate: measurement.endDate,
				});
			} else {
				if (
					dayjs(lastPeriod.endDate).isAfter(dayjs(measurement.startDate)) &&
					(dayjs(measurement.endDate).isAfter(dayjs(lastPeriod.endDate)) ||
						dayjs(measurement.endDate).isSame(dayjs(lastPeriod.endDate)))
				) {
					const periodDuration = dayjs(measurement.endDate).diff(lastPeriod.startDate, "seconds");
					const sleepStartPercentage = lastPeriod.startPercentage;
					const sleepEndPercentage = +(+sleepStartPercentage + periodDuration / SECONDS_IN_DAY).toFixed(4);
					if (sleepEndPercentage === sleepStartPercentage) {
						return acc;
					}
					acc[acc.length - 1] = {
						startPercentage: +sleepStartPercentage,
						endPercentage: +sleepEndPercentage,
						startDate: lastPeriod.startDate,
						endDate: measurement.endDate,
					};
					return acc;
				}
				if (!dayjs(measurement.endDate).isBefore(dayjs(lastPeriod.endDate))) {
					if (dayjs(lastPeriod.endDate).isSame(dayjs(measurement.startDate))) {
						const periodDuration = dayjs(measurement.endDate).diff(lastPeriod.startDate, "seconds");

						const sleepStartPercentage = lastPeriod.startPercentage;
						const sleepEndPercentage = +(+sleepStartPercentage + periodDuration / SECONDS_IN_DAY).toFixed(4);
						acc[acc.length - 1] = {
							startPercentage: lastPeriod.startPercentage,
							endPercentage: +sleepEndPercentage,
							startDate: lastPeriod.startDate,
							endDate: measurement.endDate,
						};
						return acc;
					}
					const sleepStart = dayjs(measurement.startDate);
					const periodDuration = dayjs(measurement.endDate).diff(measurement.startDate, "seconds");
					const sleepStartPercentage = +(dayjs(sleepStart).diff(startOfTheDay, "seconds") / SECONDS_IN_DAY).toFixed(4);
					const sleepEndPercentage = +(+sleepStartPercentage + periodDuration / SECONDS_IN_DAY).toFixed(4);

					acc.push({
						startPercentage: +sleepStartPercentage,
						endPercentage: +sleepEndPercentage,
						startDate: measurement.startDate,
						endDate: measurement.endDate,
					});
				}
			}
			return acc;
		},
		[] as { startPercentage: number; endPercentage: number; startDate: Date; endDate: Date }[]
	);
	return resultsObj;
};

export default calculateSleepPercentages;
