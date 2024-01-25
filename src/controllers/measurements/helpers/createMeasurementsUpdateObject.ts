import { Types } from "mongoose";
import { IMeasurementObject } from "@controllers/measurements/helpers/createDatesObject";

const createMeasurementsUpdateObject = (measurementsArray: IMeasurementObject[], usersID: string) => {
	const measurementsToUpdate = measurementsArray.map((measurement) => {
		const bulkObject = {
			updateOne: {
				filter: {
					usersID: new Types.ObjectId(usersID),
					measurementCode: measurement.code,
					date: new Date(measurement.date),
					startDate: measurement.startDate,
					endDate: measurement.endDate,
				},
				update: {
					$set: {
						lastUpdated: new Date(),
						measurementCode: measurement.code,
						source: measurement.source,
						value: measurement.value,
						unit: measurement.unit,
					},
				},
				upsert: true,
			},
		};
		return bulkObject;
	});
	return measurementsToUpdate;
};

export default createMeasurementsUpdateObject;
