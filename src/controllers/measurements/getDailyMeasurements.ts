import { Response } from "express";
import { logger } from "@logger/index";
import { IResponseWithData } from "@controllers/controllers.interface";
import { ExtendedRequest } from "@middlewares/checkAuth";
import dayjs from "dayjs";
import validator from "validator";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import getStartOfDay from "@helpers/getStartOfTheDay";
import { Types } from "mongoose";

const { ObjectId } = Types;

type RequestQuery = {
	date?: string;
};

type Measurement = {
	value: number;
	unit: string;
	name: string;
};

type IResponseData = Measurement[] | [];
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

		const measurements = await UsersDailyMeasurements.aggregate([
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
				},
			},
		]);
		const measurementsWithPrecision = measurements.map((measurement) => {
			const { precision } = measurement;
			if (precision) {
				measurement.value = Number(measurement.value.toFixed(precision));
			}
			return measurement;
		});
		responseJSON.data = measurementsWithPrecision as IResponseData | [];
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error in getDailyMeasurements: ${e}`, e);
		return res.status(500).json(responseJSON);
	}
};

export default getDailyMeasurements;
