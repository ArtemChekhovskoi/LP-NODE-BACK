import { HealthValue } from "@constants/measurements";
import { ClientSession, Types } from "mongoose";
import { UsersHeight } from "@models/users_height";

const { ObjectId } = Types;

const saveAppleHealthHeight = async (height: HealthValue[], usersID: string, mongoSession: ClientSession) => {
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

	await UsersHeight.bulkWrite(heightBulkUpdateArray, { session: mongoSession });

	return true;
};

export default saveAppleHealthHeight;
