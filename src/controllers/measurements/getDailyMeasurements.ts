import { Response } from "express";
import { logger } from "@logger/index";
import { IResponseWithData } from "@controllers/controllers.interface";
import { ExtendedRequest } from "@middlewares/checkAuth";
import dayjs from "dayjs";
import validator from "validator";
import getStartOfDay from "@helpers/getStartOfTheDay";
import { ACTIVE_MEASUREMENTS, MEASUREMENTS_GROUPS } from "@constants/measurements";
import getReducedMeasurementsConfig from "@controllers/measurements/helpers/getReducedMeasurementsConfig";
import { getDailyHeartRateByDates, getDailyReflections, getMeasurementFromDailySum } from "@helpers/getMeasurementsByType";

type RequestQuery = {
	date?: string;
};

export type ReturnedDailyMeasurement = {
	value: number;
	unit?: string;
	name: string;
	precision?: number;
};

type IResponseData = ReturnedDailyMeasurement[] | [];

const MEASUREMENTS_DAILY_STRATEGY = {
	[MEASUREMENTS_GROUPS.DAILY_HEART_RATE.code]: (dates: Date[], usersID: string) => getDailyHeartRateByDates(dates, usersID),
	[MEASUREMENTS_GROUPS.SLEEP_DURATION.code]: (dates: Date[], usersID: string) =>
		getMeasurementFromDailySum(dates, usersID, ACTIVE_MEASUREMENTS.SLEEP_DURATION),
	[MEASUREMENTS_GROUPS.DAILY_STEPS.code]: (dates: Date[], usersID: string) =>
		getMeasurementFromDailySum(dates, usersID, ACTIVE_MEASUREMENTS.DAILY_STEPS),
	[MEASUREMENTS_GROUPS.DAILY_DISTANCE.code]: (dates: Date[], usersID: string) =>
		getMeasurementFromDailySum(dates, usersID, ACTIVE_MEASUREMENTS.DAILY_DISTANCE),
	[MEASUREMENTS_GROUPS.DAILY_REFLECTIONS.code]: (dates: Date[], usersID: string) => getDailyReflections(dates, usersID),
	[MEASUREMENTS_GROUPS.DAILY_ACTIVITY.code]: (dates: Date[], usersID: string) =>
		getMeasurementFromDailySum(dates, usersID, ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_DURATION),
	[ACTIVE_MEASUREMENTS.DAILY_CALORIES_BURNED]: (dates: Date[], usersID: string) =>
		getMeasurementFromDailySum(dates, usersID, ACTIVE_MEASUREMENTS.DAILY_CALORIES_BURNED),
};

const getDailyMeasurements = async (req: ExtendedRequest, res: Response) => {
	const responseJSON: IResponseWithData<IResponseData> = {
		success: false,
		error: "",
		errorCode: "",
		data: [],
	};

	try {
		const { usersID } = req;
		let { date } = req.query as unknown as RequestQuery;

		if (!date || !validator.isDate(date)) {
			date = dayjs().format("YYYY-MM-DD");
		}

		if (!usersID) {
			throw new Error("User ID is required");
		}

		const startOfTheDay = getStartOfDay(new Date(date));

		const reducedMeasurementsConfig = await getReducedMeasurementsConfig();

		const fetchedMeasurements = await Promise.all(
			Object.values(MEASUREMENTS_DAILY_STRATEGY).map((strategy) => strategy([startOfTheDay], usersID))
		);

		const preparedMeasurements = [] as ReturnedDailyMeasurement[];
		for (const measurementsGroup of fetchedMeasurements) {
			for (const [key, measurements] of Object.entries(measurementsGroup)) {
				const measurementConfig = reducedMeasurementsConfig[key];
				if (!measurementConfig || !measurements?.length) {
					continue;
				}

				if (Array.isArray(measurements) && !measurements[0].value) {
					continue;
				}
				preparedMeasurements.push({
					...measurementConfig,
					value: measurements[0].value.toFixed(measurementConfig.precision || 0) || 0,
				});
			}
		}

		responseJSON.data = preparedMeasurements;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error in getDailyMeasurements: ${e}`, e);
		return res.status(500).json(responseJSON);
	}
};

export default getDailyMeasurements;
