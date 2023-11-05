import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import getDailyWeather from "@helpers/getDailyWeather";
import { Measurements } from "@models/measurements";
import { UsersDailyCustomMeasurements } from "@models/users_daily_custom_measurments";
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
    const measurementInfo = await Measurements.findOne(
      {
        code: "weather",
      },
      { _id: true, code: true },
    );
    const todayUserWeather = await UsersDailyCustomMeasurements.findOne({
      usersID,
      date: timeOnStartOfTheDay,
      "measurements.code": measurementInfo?.code,
    });
    if (todayUserWeather && todayUserWeather.measurements) {
      const weatherMeasurement = todayUserWeather.measurements.find(
        (measurement) => measurement.code === measurementInfo?.code,
      );
      if (weatherMeasurement && weatherMeasurement.customFields) {
        responseJSON.success = true;
        responseJSON.data = weatherMeasurement.customFields.weather;
        return res.json(responseJSON);
      }
    }

    const weatherInfo = await getDailyWeather(long, lat);
    if (!weatherInfo || !weatherInfo.success || !weatherInfo.weather) {
      responseJSON.error = "Can't fetch weather";
      responseJSON.errorCode = "CANT_FETCH";
      return res.status(400).json(responseJSON);
    }

    if (!measurementInfo) {
      responseJSON.error = "Measurement not found";
      responseJSON.errorCode = "INCORRECT_PARAMETER";
      return res.status(404).json(responseJSON);
    }

    await UsersDailyCustomMeasurements.updateOne(
      {
        usersID,
        date: timeOnStartOfTheDay,
      },
      {
        $set: {
          lastUpdated: new Date(),
        },
        $addToSet: {
          measurements: {
            code: measurementInfo.code,
            customFields: {
              location: weatherInfo.location,
              weather: weatherInfo.weather,
            },
          },
        },
      },
      { upsert: true },
    );

    responseJSON.success = true;
    responseJSON.data = weatherInfo.weather;
    return res.status(200).json(responseJSON);
  } catch (e) {
    logger.error(`Error at controllers/user/postUpdateDailyWeather: ${e}`);
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return res.status(500).json(responseJSON);
  }
};

export default postUpdateDailyWeather;
