import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import getDailyWeather from "@helpers/getDailyWeather";
import { UsersDailyWeather } from "@models/users_daily_weather";
import getStartOfDay from "@helpers/getStartOfTheDay";

const postUpdateDailyWeather = async (req: ExtendedRequest, res: Response) => {
	const responseJSON = {
		success: false,
		error: "",
		errorCode: "",
		data: {},
	};
	try {
		const { long, lat } = req.body;
		const { usersID } = req;

		const timeOnStartOfTheDay = getStartOfDay(new Date());
		const weatherInfo = await getDailyWeather(long, lat);
		if (!weatherInfo || !weatherInfo.success || !weatherInfo.weather) {
			responseJSON.error = "Can't fetch weather";
			responseJSON.errorCode = "CANT_FETCH";
			return res.status(400).json(responseJSON);
		}

		const { weather, location, icon } = weatherInfo;
		await UsersDailyWeather.updateOne(
			{
				usersID,
				date: timeOnStartOfTheDay,
			},
			{
				$set: {
					location,
					title: weather?.condition,
					avgTemp_c: weather?.avgTemp,
					humidity: weather?.humidity,
					wind_kph: weather?.wind,
					lastUpdated: new Date(),
					icon: `https:${icon}`,
				},
			},
			{ upsert: true }
		);

		responseJSON.success = true;
		responseJSON.data = weatherInfo.weather;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error at controllers/user/postUpdateDailyWeather: ${e}`, e);
		responseJSON.error = "Something went wrong";
		responseJSON.errorCode = "SOMETHING_WRONG";
		return res.status(500).json(responseJSON);
	}
};

export default postUpdateDailyWeather;
