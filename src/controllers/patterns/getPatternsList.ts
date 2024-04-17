import { logger } from "@logger/index";
import { Response } from "express";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { parseArrayInQuery } from "@helpers/parseArrayInQuery";
import { IResponseWithData } from "@controllers/controllers.interface";
import { DATA_PRESENTATION, IDataPresentationByDate } from "@constants/patterns";
import calculateAverageByDate from "@controllers/patterns/helpers/calculateAverageByDate";
import generateDatesArray from "@helpers/generateDatesArray";
import { getMeasurementsScale } from "@controllers/patterns/helpers/getMeasurementsScale";
import { ACTIVE_MEASUREMENTS, IActiveMeasurementsInPatternsValues } from "@constants/measurements";
import {
	getDailyHeartRateByDates,
	getDailyReflections,
	getHeightByDates,
	getMeasurementFromDailySum,
	getWeightByDates,
} from "@helpers/getMeasurementsByType";
import getStartOfDay from "@helpers/getStartOfTheDay";
import prepareMeasurementsForReturn from "@helpers/prepareMeasurementsForReturn";
import getReducedMeasurementsConfig from "@controllers/measurements/helpers/getReducedMeasurementsConfig";

interface RequestQuery {
	startDate: string;
	endDate: string;
	measurements: string;
	presentation: IDataPresentationByDate;
}

export interface IPatternsListResponseData {
	name: string;
	unit?: string;
	code: string;
	precision?: number;
	measurements: Array<{
		value: number | null;
		date?: Date;
	}>;
}

export interface IPatternsListResponseWithScales extends IPatternsListResponseData {
	scale: number[];
	minScaleValue: number;
	maxScaleValue: number;
	maxMultiplier: number;
}

const QUERIES_BY_MEASUREMENT_TYPES = {
	[ACTIVE_MEASUREMENTS.AVG_HEART_RATE]: getDailyHeartRateByDates,
	[ACTIVE_MEASUREMENTS.MAX_HEART_RATE]: getDailyHeartRateByDates,
	[ACTIVE_MEASUREMENTS.MIN_HEART_RATE]: getDailyHeartRateByDates,
	[ACTIVE_MEASUREMENTS.WEIGHT]: getWeightByDates,
	[ACTIVE_MEASUREMENTS.HEIGHT]: getHeightByDates,
	[ACTIVE_MEASUREMENTS.SLEEP_DURATION]: (dates: Date[], usersID: string) =>
		getMeasurementFromDailySum(dates, usersID, ACTIVE_MEASUREMENTS.SLEEP_DURATION),
	[ACTIVE_MEASUREMENTS.DAILY_STEPS]: (dates: Date[], usersID: string) =>
		getMeasurementFromDailySum(dates, usersID, ACTIVE_MEASUREMENTS.DAILY_STEPS),
	[ACTIVE_MEASUREMENTS.DAILY_DISTANCE]: (dates: Date[], usersID: string) =>
		getMeasurementFromDailySum(dates, usersID, ACTIVE_MEASUREMENTS.DAILY_DISTANCE),
	[ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_FEELING]: getDailyReflections,
	[ACTIVE_MEASUREMENTS.DAILY_SLEEP_QUALITY]: getDailyReflections,
	[ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_DURATION]: (dates: Date[], usersID: string) =>
		getMeasurementFromDailySum(dates, usersID, ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_DURATION),
	[ACTIVE_MEASUREMENTS.DAILY_CALORIES_BURNED]: (dates: Date[], usersID: string) =>
		getMeasurementFromDailySum(dates, usersID, ACTIVE_MEASUREMENTS.DAILY_CALORIES_BURNED),
} as const;

const getPatternsList = async (req: ExtendedRequest, res: Response) => {
	const responseJSON: IResponseWithData<IPatternsListResponseWithScales[] | []> = {
		success: false,
		error: "",
		errorCode: "",
		data: [],
	};
	try {
		const { startDate, endDate, measurements, presentation } = req.query as unknown as RequestQuery;
		const { usersID } = req;
		const measurementsArray = parseArrayInQuery(measurements) as IActiveMeasurementsInPatternsValues[];

		if (!measurementsArray.length) {
			responseJSON.error = "Measurements is required";
			responseJSON.errorCode = "MEASUREMENTS_REQUIRED";
			return res.status(400).json(responseJSON);
		}
		const reducedMeasurementsConfig = await getReducedMeasurementsConfig();

		const isMeasurementsValid = measurementsArray.every((item) => {
			return Object.keys(reducedMeasurementsConfig).includes(item);
		});

		if (!isMeasurementsValid) {
			responseJSON.error = "Invalid measurements";
			responseJSON.errorCode = "INVALID_MEASUREMENTS";
			return res.status(400).json(responseJSON);
		}

		const dateArray = generateDatesArray(getStartOfDay(startDate), getStartOfDay(endDate));
		const measurementsData = await Promise.all(
			measurementsArray.map(async (measurementKey) => {
				const getMeasurementsFunction = QUERIES_BY_MEASUREMENT_TYPES[measurementKey];
				if (!getMeasurementsFunction) {
					throw new Error(`Query for measurement ${measurementKey} not found`);
				}
				const measurementsObj = (await getMeasurementsFunction(dateArray, usersID!)) as any;
				return { [measurementKey]: measurementsObj[measurementKey] };
			})
		);
		let preparedData = prepareMeasurementsForReturn(measurementsData, reducedMeasurementsConfig);

		if (presentation !== DATA_PRESENTATION.DAY) {
			preparedData = calculateAverageByDate(preparedData, presentation);
		}
		const dataWithScales = getMeasurementsScale(preparedData);
		responseJSON.success = true;
		responseJSON.data = dataWithScales;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error in controllers/getPatternsList: ${e}`);
		logger.error(e);
		responseJSON.error = "Internal server error";
		responseJSON.errorCode = "INTERNAL_SERVER_ERROR";
		return res.status(500).json(responseJSON);
	}
};

export default getPatternsList;
