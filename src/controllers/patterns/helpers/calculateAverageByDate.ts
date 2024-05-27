import dayjs from "dayjs";
import { IPatternsListResponseData } from "@controllers/patterns/getPatternsList";
import utc from "dayjs/plugin/utc";
import advancedFormat from "dayjs/plugin/advancedFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { decimalAdjust } from "@helpers/decimalAdjust";

import { DATA_PRESENTATION_ARRAY, IDataPresentationByDate, PRESENTATION_FORMAT } from "@constants/patterns";

dayjs.extend(utc);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);

const calculateAverageByDate = (data: IPatternsListResponseData[], presentation: IDataPresentationByDate) => {
	if (!DATA_PRESENTATION_ARRAY.includes(presentation)) {
		throw new Error("Invalid presentation. Must be one of: day, week, month");
	}
	const calculateAverage = (measurements: number[]) => {
		const totalValue = measurements.reduce((sum, measurement) => sum + measurement, 0);
		const notNullMeasurementsAmount = measurements.filter((measurement) => measurement !== 0).length;
		return measurements.length > 0 ? totalValue / notNullMeasurementsAmount : 0;
	};

	// Create a map to store averages by month
	const averagesByDate = new Map();

	// Iterate through the array of values
	data.forEach((item) => {
		// Iterate through measurements for each item
		item.measurements.forEach((measurement) => {
			// Use moment to format the date and extract year and month
			const uniqueDate = dayjs(measurement.date).format(PRESENTATION_FORMAT[presentation]);
			// If the yearMonth key does not exist in the map, create an array
			if (!averagesByDate.has(uniqueDate)) {
				averagesByDate.set(uniqueDate, []);
			}

			// Add the measurement value to the array for the corresponding month
			averagesByDate.get(uniqueDate).push({
				measurementType: item.code,
				value: measurement.value,
			});
		});
	});

	// Convert the map to an array of objects with averages
	const result = Array.from(averagesByDate.entries()).map(([uniqueDate, measurements]) => ({
		date: uniqueDate,
		measurements: measurements.reduce((acc: any, curr: any) => {
			if (!acc[curr.measurementType]) {
				acc[curr.measurementType] = [];
			}
			acc[curr.measurementType].push(curr.value);
			return acc;
		}, {}),
	}));

	const resultWithAverageValues = result.map((item) => ({
		date: item.date,
		measurements: Object.keys(item.measurements).map((measurementType) => ({
			measurementType,
			value: calculateAverage(item.measurements[measurementType]),
		})),
	}));
	// Create the final structure
	return data.map((item) => ({
		...item,
		measurements: resultWithAverageValues.map((period) => {
			const measurement = period.measurements.find((measurementInfo) => measurementInfo.measurementType === item.code);
			return {
				date: period.date,
				value: decimalAdjust(measurement?.value || 0, item.precision),
			};
		}),
	}));
};

export default calculateAverageByDate;
