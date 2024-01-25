import getStartOfDay from "@helpers/getStartOfTheDay";
import { Types } from "mongoose";
import { HealthValue } from "@constants/measurements";

export interface IMeasurementsConfig {
	code: string;
	unit: string;
	_id: Types.ObjectId;
}

export interface IMeasurementObject {
	measurementID?: Types.ObjectId;
	unit?: string;
	date: string;
	code: string;
	value: number;
	source: string;
	startDate: string;
	endDate: string;
}
const createDatesObject = (data: HealthValue[], config: IMeasurementsConfig, measurementSource: string) => {
	const measurementsArray: IMeasurementObject[] = [];
	const { unit, code } = config;
	data.forEach((measurement) => {
		const date = getStartOfDay(measurement.startDate).toISOString();
		measurementsArray.push({
			unit,
			date,
			code,
			value: measurement.value,
			source: measurementSource,
			startDate: measurement?.startDate,
			endDate: measurement?.endDate,
		});
	});
	return measurementsArray;
};

export default createDatesObject;
