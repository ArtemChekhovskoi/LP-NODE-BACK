import { Users } from "@models/users";
import { UsersPendingHealthSync } from "@models/users_pending_health_sync";
import { Model } from "mongoose";
import { logger } from "@logger/index";

interface IRollbackHealthSync {
	usersID: string;
	modelsByCollectionName: { [key: string]: Model<any> };
}
const rollbackHealthSync = async ({ usersID, modelsByCollectionName }: IRollbackHealthSync) => {
	try {
		const user = await Users.findOne({ _id: usersID }, { lastSyncDate: true });
		const pendingTransaction = await UsersPendingHealthSync.findOne({ usersID }, { syncedCollections: true });
		if (!user || !pendingTransaction) {
			throw new Error("User or pending transaction not found in rollbackHealthSync");
		}

		const { syncedCollections } = pendingTransaction;
		for (const collectionName of syncedCollections) {
			const model = modelsByCollectionName[collectionName];
			if (!model) {
				throw new Error(`Model not found for ${collectionName}`);
			}
			await model.deleteMany({ usersID, lastUpdated: { $gte: user.lastSyncDate } });
		}

		await UsersPendingHealthSync.deleteOne({ usersID });
	} catch (e) {
		logger.error("Error while rolling back health sync", e);
		throw e;
	}
};

export default rollbackHealthSync;
