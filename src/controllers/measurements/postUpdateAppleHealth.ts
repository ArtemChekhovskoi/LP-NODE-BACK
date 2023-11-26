import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import createDatesObject from "@controllers/measurements/helpers/createDatesObject";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import { Measurements } from "@models/measurements";
import { Users } from "@models/users";
import {
  MEASUREMENT_CODES,
  MEASUREMENT_SOURCES,
} from "@constants/measurements";
import extractObjectFieldFromArray from "@helpers/extractObjectFieldFromArray";
import createMeasurementsUpdateObject from "@controllers/measurements/helpers/createMeasurementsUpdateObject";
import mongoose, { ClientSession } from "mongoose";
import {
  saveSleepSamples,
  ISleepSample,
} from "@controllers/measurements/helpers/saveSleepSamples";
import {
  IActivitySample,
  saveActivitySamples,
} from "@controllers/measurements/helpers/saveActivitySamples";

export interface HealthValue {
  id?: string;
  startDate: string;
  endDate: string;
  value: number;
  type?: string;
}
interface RequestBody {
  lastSyncDate: string;
  data: Array<{ [key: string]: HealthValue[] | ISleepSample[] }>;
}
const postUpdateAppleHealth = async (req: ExtendedRequest, res: Response) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
  };
  let mongoSession: ClientSession | undefined;
  try {
    const { usersID } = req;
    const { lastSyncDate, data } = req.body as RequestBody;

    if (data.length === 0) {
      responseJSON.error = "Nothing to sync";
      responseJSON.errorCode = "MISSING_DATA";
      return res.status(400).json(responseJSON);
    }

    const measurementsConfig = await Measurements.find(
      { type: "auto" },
      { code: true, unit: true, _id: true },
    );

    const extractedSleepSamples = extractObjectFieldFromArray(
      data,
      MEASUREMENT_CODES.SLEEP,
    ) as ISleepSample[];
    const extractedExerciseSamples = extractObjectFieldFromArray(
      data,
      MEASUREMENT_CODES.ACTIVITY,
    ) as IActivitySample[];

    if (extractedExerciseSamples && extractedExerciseSamples?.length) {
      await saveActivitySamples(
        extractedExerciseSamples as IActivitySample[],
        usersID!,
        MEASUREMENT_SOURCES.APPLE_HEALTH,
      );
    }
    if (extractedSleepSamples && extractedSleepSamples?.length) {
      await saveSleepSamples(
        extractedSleepSamples as ISleepSample[],
        usersID!,
        MEASUREMENT_SOURCES.APPLE_HEALTH,
      );
    }
    const measurementsArray = createDatesObject(
      data as { [key: string]: HealthValue[] }[],
      measurementsConfig,
      MEASUREMENT_SOURCES.APPLE_HEALTH,
    );

    const measurementsToUpdate = createMeasurementsUpdateObject(
      measurementsArray,
      usersID!,
      lastSyncDate,
    );
    mongoSession = await mongoose.connection.startSession();
    await mongoSession.withTransaction(async () => {
      await UsersDailyMeasurements.bulkWrite(measurementsToUpdate, {
        session: mongoSession,
      });
      await Users.updateOne(
        { _id: usersID },
        { lastSyncDate: new Date() },
        { session: mongoSession },
      );
    });

    responseJSON.success = true;
    return res.status(200).json(responseJSON);
  } catch (e) {
    logger.error(
      `Error at controllers/measurements/postUpdateAppleHealth: ${e}`,
    );
    logger.error(e);
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return res.status(500).json(responseJSON);
  }
};

export default postUpdateAppleHealth;
