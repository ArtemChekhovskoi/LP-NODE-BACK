import { Response } from "express";
import { logger } from "@logger/index";

import { ExtendedRequest } from "@middlewares/checkAuth";
import { UsersPendingHealthSync } from "@models/users_pending_health_sync";

const getSyncStatus = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
		data: {
			isSyncing: false,
			progress: 0,
		},
	};
	try {
		const { usersID } = req;

		const syncStatus = await UsersPendingHealthSync.findOne({ usersID }, { progress: true });
		if (!syncStatus) {
			responseJSON.data.isSyncing = false;
			responseJSON.success = true;
			return res.status(200).json(responseJSON);
		}

		responseJSON.data.isSyncing = true;
		responseJSON.data.progress = syncStatus.progress;
		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at getSyncStatus: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default getSyncStatus;
