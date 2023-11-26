import { logger } from "@logger/index";
import { Response } from "express";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { Measurements } from "@models/measurements";
import { Types } from "mongoose";
import { parseArrayInQuery } from "@helpers/parseArrayInQuery";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import { IResponseWithData } from "@controllers/controllers.interface";
import {
  DATA_PRESENTATION,
  IDataPresentationByDate,
} from "@constants/patterns";
import calculateAverageByDate from "@controllers/patterns/helpers/calculateAverageByDate";

const { ObjectId } = Types;
interface RequestQuery {
  startDate: string;
  endDate: string;
  measurements: string;
  presentation: IDataPresentationByDate;
}

export interface IPatternsListResponseData {
  name: string;
  unit: string;
  code: string;
  precision: number;
  measurements: Array<{
    value: number;
    date: Date;
  }>;
}

const getPatternsList = async (req: ExtendedRequest, res: Response) => {
  const responseJSON: IResponseWithData<IPatternsListResponseData[] | []> = {
    success: false,
    error: "",
    errorCode: "",
    data: [],
  };
  try {
    const { startDate, endDate, measurements, presentation } =
      req.query as unknown as RequestQuery;
    const { usersID } = req;

    const measurementsArray = parseArrayInQuery(measurements);

    if (!measurementsArray.length) {
      responseJSON.error = "Measurements is required";
      responseJSON.errorCode = "MEASUREMENTS_REQUIRED";
      return res.status(400).json(responseJSON);
    }

    const measurementsConfig = await Measurements.find(
      {
        active: true,
        code: { $in: measurementsArray },
      },
      { code: true, name: true, unit: true, precision: true },
    ).lean();

    const isMeasurementsValid = measurementsArray.every((item) => {
      return measurementsConfig.find((config) => config.code === item);
    });

    if (!isMeasurementsValid) {
      responseJSON.error = "Invalid measurements";
      responseJSON.errorCode = "INVALID_MEASUREMENTS";
      return res.status(400).json(responseJSON);
    }

    let measurementsData = await Promise.all(
      measurementsConfig.map(async (item) => {
        const measurementsByDate = await UsersDailyMeasurements.find(
          {
            usersID: new ObjectId(usersID),
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
            measurementCode: item.code,
          },
          {
            value: true,
            date: true,
            _id: false,
          },
        )
          .sort({ date: -1 })
          .lean();
        return {
          name: item.name,
          unit: item.unit,
          code: item.code,
          precision: item.precision,
          measurements: measurementsByDate,
        } as IPatternsListResponseData;
      }),
    );

    if (presentation !== DATA_PRESENTATION.DAY) {
      measurementsData = calculateAverageByDate(measurementsData, presentation);
    }

    responseJSON.success = true;
    responseJSON.data = measurementsData;
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
