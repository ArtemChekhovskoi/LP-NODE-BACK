import { Response } from "express";
import { logger } from "@logger/index";
import { IResponseWithData } from "@controllers/controllers.interface";
import { ExtendedRequest } from "@middlewares/checkAuth";
import dayjs from "dayjs";
import validator from "validator";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import getStartOfDay from "@helpers/getStartOfTheDay";
import { Types } from "mongoose";
import { calculateAverageMeasurement } from "@helpers/calculateAverageMeasurement";

const { ObjectId } = Types;

type RequestQuery = {
	date?: string;
};

export type ReturnedDailyMeasurement = {
	value: number;
	unit: string;
	name: string;
	precision: number;
};

type IResponseData = ReturnedDailyMeasurement[] | [];
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

		const filter = {
			usersID: new ObjectId(usersID),
			date: getStartOfDay(new Date(date)),
		};

		const measurements: ReturnedDailyMeasurement[] = await UsersDailyMeasurements.aggregate([
			{
				$match: filter,
			},
			{
				$lookup: {
					from: "measurements",
					localField: "measurementCode",
					foreignField: "code",
					as: "measurementData",
				},
			},
			{
				$unwind: "$measurementData",
			},
			{
				$project: {
					_id: false,
					value: true,
					unit: "$measurementData.unit",
					name: "$measurementData.name",
					precision: "$measurementData.precision",
					isOnePerDay: "$measurementData.isOnePerDay",
				},
			},
		]);

		if (!measurements || measurements.length === 0) {
			return res.status(200).json(responseJSON);
		}

		const reducedMeasurements = measurements.reduce(
			(acc, measurement) => {
				const { name, value, unit, precision } = measurement;
				if (acc[name]) {
					acc[name].push({ value, unit, precision, name });
				} else {
					acc[name] = [{ value, unit, precision, name }];
				}
				return acc;
			},
			{} as Record<string, ReturnedDailyMeasurement[]>
		);

		const preparedMeasurements = Object.values(reducedMeasurements).map((dailyMeasurements) => {
			let measurement = dailyMeasurements[0];
			if (dailyMeasurements.length > 1) {
				measurement = calculateAverageMeasurement(dailyMeasurements);
			}

			const { precision, value } = measurement;
			return {
				...measurement,
				value: Number(value.toFixed(precision)),
			};
		});

		responseJSON.data = preparedMeasurements;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error in getDailyMeasurements: ${e}`, e);
		return res.status(500).json(responseJSON);
	}
};

export default getDailyMeasurements;
