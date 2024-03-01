import { Response } from "express";
import { Types } from "mongoose";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { UsersDailyEmotions } from "@models/users_daily_emotions";
import { UsersDailyNotes } from "@models/users_daily_notes";

import generateDatesArray from "@helpers/generateDatesArray";
import { IResponseWithData } from "@controllers/controllers.interface";
import { EmotionsConfig } from "@models/emotions_config";
import { UsersDailyWeather } from "@models/users_daily_weather";

interface RequestQuery {
	startDate: string;
	endDate: string;
}

interface IResponseData {
	date: Date;
	[key: string]: unknown;
}
const getList = async (req: ExtendedRequest, res: Response) => {
	const responseJSON: IResponseWithData<IResponseData[]> = {
		success: false,
		error: "",
		errorCode: "",
		data: [],
	};
	try {
		const { usersID } = req;
		const { startDate, endDate } = req.query as unknown as RequestQuery;

		const filter = {
			usersID: new Types.ObjectId(usersID),
			date: { $gte: new Date(startDate), $lte: new Date(endDate) },
		};

		const [usersEmotions, usersDailyNotes, usersDailyWeather, emotionsConfig] = await Promise.all([
			UsersDailyEmotions.find(filter, {
				emotionsID: true,
				date: true,
				_id: false,
			})
				.lean()
				.sort({ date: 1 }),
			UsersDailyNotes.find(filter, {
				notes: true,
				date: true,
				_id: false,
			})
				.lean()
				.sort({ date: 1 }),
			UsersDailyWeather.find(filter, {
				icon: true,
				date: true,
				title: true,
			}),
			EmotionsConfig.find({ active: true }).lean(),
		]);

		const datesArray = generateDatesArray(new Date(startDate), new Date(endDate));
		const data = datesArray.map((date) => {
			const dateObject: IResponseData = {
				date,
				emotion: null,
				notes: "",
			};

			const usersEmotionsWithConfig = usersEmotions.map((item) => {
				const emotionConfig = emotionsConfig.find((config) => config._id.toString() === item.emotionsID.toString());
				return {
					date: item.date,
					...emotionConfig,
				};
			});
			const usersEmotionByDate = usersEmotionsWithConfig.find((item) => item.date.toISOString() === date.toISOString());
			const usersDailyNoteByDate = usersDailyNotes.find((item) => item.date.toISOString() === date.toISOString());
			const usersDailyWeatherByDate = usersDailyWeather.find((item) => item.date.toISOString() === date.toISOString());

			if (usersEmotionByDate) {
				dateObject.emotion = usersEmotionByDate;
			}
			if (usersDailyNoteByDate) {
				dateObject.notes = usersDailyNoteByDate.notes;
			}
			if (usersDailyWeatherByDate) {
				dateObject.weather = usersDailyWeatherByDate;
			}

			return dateObject;
		});
		responseJSON.data = data;
		responseJSON.success = true;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/measurements/getMeasurementsList: ${e}`);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default getList;
