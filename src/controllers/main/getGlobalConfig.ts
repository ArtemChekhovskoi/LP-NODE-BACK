import { ExtendedRequest } from "@middlewares/checkAuth";
import { Response } from "express";
import { logger } from "@logger/index";
import { EmotionsConfig } from "@models/emotions_config";
import { Measurements } from "@models/measurements";
import { IResponseWithData } from "@controllers/controllers.interface";
import { Types } from "mongoose";

interface IMeasurementConfig {
  unit: string;
  precision?: number;
  code?: string;
}

interface IEmotionConfig {
  _id: Types.ObjectId;
  emotion: string;
  emoji: string;
  color: string;
}

interface IResponseData {
  measurements: { [key: string]: IMeasurementConfig };
  emotions: IEmotionConfig[];
}

const getGlobalConfig = async (req: ExtendedRequest, res: Response) => {
  const responseJSON: IResponseWithData<IResponseData> = {
    success: false,
    error: "",
    errorCode: "",
    data: {
      measurements: {},
      emotions: [],
    },
  };
  try {
    const [measurementsConfig, emotionsConfig] = await Promise.all([
      await Measurements.find(
        { active: true },
        { code: true, unit: true, precision: true, _id: false },
      ).lean(),
      await EmotionsConfig.find(
        { active: true },
        { emotion: true, emoji: true, _id: true, color: true },
      ).lean(),
    ]);
    if (!measurementsConfig.length || !emotionsConfig.length) {
      responseJSON.error = "Not found config";
      responseJSON.errorCode = "NOT_FOUND";
      return res.status(404).json(responseJSON);
    }

    const measurementsObject = measurementsConfig.reduce(
      (acc: { [key: string]: IMeasurementConfig }, item) => {
        acc[item.code] = item;
        delete acc[item.code].code;
        return acc;
      },
      {},
    );
    responseJSON.data.measurements = measurementsObject;
    responseJSON.data.emotions = emotionsConfig;
    responseJSON.success = true;
    return res.status(200).json(responseJSON);
  } catch (error) {
    logger.error(`Error in controllers/main/getGlobalConfig: ${error}`);
    logger.error(error);
    responseJSON.error = "Unexpected error";
    responseJSON.errorCode = "UNEXPECTED_ERROR";
    return res.status(500).json(responseJSON);
  }
};

export default getGlobalConfig;
