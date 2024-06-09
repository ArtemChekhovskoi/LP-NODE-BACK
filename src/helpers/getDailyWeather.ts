import config from "@config/index";
import { logger } from "@logger/index";

const getDailyWeather = async (long: number, lat: number) => {
	try {
		const apiKey = process.env.WEATHER_API_KEY;
		const { url } = config.weather;
		const requestUrl = `${url}/forecast.json?q=${lat},${long}&ays=1&key=${apiKey}`;
		const response = await fetch(requestUrl);
		const data = await response.json();
		if (!data) {
			return {
				success: false,
				error: "No data",
			};
		}

		return {
			success: true,
			date: data.forecast.forecastday[0].date,
			location: {
				name: data.location.name,
				region: data.location.region,
				country: data.location.country,
			},
			weather: {
				condition: data.current?.condition.text,
				avgTemp: data.current?.temp_c,
				humidity: data.current?.humidity,
				wind: data.current?.wind_kph,
			},
			icon: data.current?.condition.icon,
		};
	} catch (e) {
		logger.error(`Error at helpers/getDailyWeather: ${e}`);
		logger.error(e);
		return {
			success: false,
			error: "Something went wrong",
		};
	}
};

export default getDailyWeather;
