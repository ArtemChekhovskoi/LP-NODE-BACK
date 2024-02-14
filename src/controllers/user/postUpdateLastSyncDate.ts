import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { Users } from "@models/users";

const postUpdateLastSyncDate = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	try {
		const { lastSyncDate } = req.body;
		const { usersID } = req;
		logger.info(`Updating last sync date for user ${usersID} and setting it to ${lastSyncDate}`);

		await Users.updateOne({ _id: usersID }, { lastSyncDate, lastUpdated: new Date() });

		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/user/postUpdateLastSyncDate: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default postUpdateLastSyncDate;
