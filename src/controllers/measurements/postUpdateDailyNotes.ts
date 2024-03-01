import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import getStartOfDay from "@helpers/getStartOfTheDay";
import { UsersDailyNotes } from "@models/users_daily_notes";
import dayjs from "dayjs";

const postUpdateDailyNotes = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
	};
	try {
		const { notes, date } = req.body;
		const { usersID } = req;

		if (dayjs(date).add(2, "day") < dayjs() || dayjs(date) > dayjs()) {
			responseJSON.error = "You can't edit notes after 2 days or future days";
			responseJSON.errorCode = "CANT_EDIT";
			return res.status(400).json(responseJSON);
		}

		logger.info(`Updating daily notes for user ${usersID}. Data: ${JSON.stringify(req.body)}`);

		const startOfTheDate = getStartOfDay(new Date(date));

		await UsersDailyNotes.updateOne(
			{ usersID, date: startOfTheDate },
			{
				notes,
				lastUpdated: new Date(),
			},
			{ upsert: true }
		);
		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/postUpdateDailyNotes: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default postUpdateDailyNotes;
