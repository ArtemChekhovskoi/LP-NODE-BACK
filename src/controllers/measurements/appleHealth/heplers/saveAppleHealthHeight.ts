import { HealthValue } from "@constants/measurements";
import { Types } from "mongoose";
import { UsersHeight } from "@models/users_height";

const { ObjectId } = Types;

const saveAppleHealthHeight = (height: HealthValue[], usersID: string) => {
	if (!height || height.length === 0) {
		throw new Error("No height data");
	}

	const heightBulkUpdateArray = height.map((measurement) => {
		return {
			updateOne: {
				filter: {
					usersID: new ObjectId(usersID),
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
			data: heightBulkUpdateArray,
			model: UsersHeight.collection.name,
		},
	];
};

export default saveAppleHealthHeight;
