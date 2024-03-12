import { Response } from "express";
import { Types } from "mongoose";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";

import generateDatesArray from "@helpers/generateDatesArray";
import { IResponseWithData } from "@controllers/controllers.interface";
import { EmotionsConfig } from "@models/emotions_config";
import { UsersDailyWeather } from "@models/users_daily_weather";
import { UsersDailyReflections } from "@models/users_daily_reflections";

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

		const [usersReflections, usersDailyWeather, emotionsConfig] = await Promise.all([
			UsersDailyReflections.find(filter, { notes: true, emotionsID: true, date: true, _id: false }).lean(),
			UsersDailyWeather.find(filter, {
				icon: true,
				date: true,
				title: true,
				_id: false,
			}).lean(),
			EmotionsConfig.find({ active: true }, { sort: false, active: false, __v: false }).lean(),
		]);

		const datesArray = generateDatesArray(new Date(startDate), new Date(endDate));
		const data = datesArray.map((date) => {
			const dateObject: IResponseData = {
				date,
				emotion: null,
				notes: "",
			};

			const reflectionByDate = usersReflections.find((item) => item.date.toISOString() === date.toISOString());
			if (reflectionByDate && reflectionByDate?.emotionsID) {
				dateObject.emotion = emotionsConfig.find(
					(config) => reflectionByDate.emotionsID && config._id.toString() === reflectionByDate.emotionsID.toString()
				);
			}
			dateObject.notes = reflectionByDate?.notes || "";
			const usersDailyWeatherByDate = usersDailyWeather.find((item) => item.date.toISOString() === date.toISOString());

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
