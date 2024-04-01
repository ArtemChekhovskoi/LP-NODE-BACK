import { HealthValue } from "@constants/measurements";
import { Types } from "mongoose";
import getStartOfDay from "@helpers/getStartOfTheDay";
import { UsersWeight } from "@models/users_weight";

const { ObjectId } = Types;

const saveAppleHealthWeight = (weight: HealthValue[], usersID: string) => {
	if (!weight || weight.length === 0) {
		throw new Error("No weight data");
	}

	const weightBulkUpdateArray = weight.map((measurement) => {
		const date = measurement?.startDate ? getStartOfDay(new Date(measurement.startDate)) : getStartOfDay(new Date());
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
					date,
				},
				update: {
					$set: {
						value: measurement.value,
						lastUpdated: new Date(),
					},
				},
				upsert: true,
			},
		};
	});

	return [
		{
			data: weightBulkUpdateArray,
			model: UsersWeight.collection.name,
		},
	];
};

export default saveAppleHealthWeight;
