import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import createDatesObject from "@controllers/measurements/helpers/createDatesObject";
import { Measurements } from "@models/measurements";
import { UsersDailyAutoMeasurements } from "@models/users_daily_auto_measurements";
import { Users } from "@models/users";
import { MEASUREMENT_SOURCES } from "@constants/measurements";
import createMeasurementsUpdateObject from "@controllers/measurements/helpers/createMeasurementsUpdateObject";

export interface HealthValue {
  id?: string;
  startDate: string;
  endDate: string;
  value: number;
  type?: string;
}
interface RequestBody {
  lastSyncDate: string;
  data: Array<{ [key: string]: HealthValue[] }>;
}
const postUpdateAppleHealth = async (req: ExtendedRequest, res: Response) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
  };
  try {
    const { usersID } = req;
    const { lastSyncDate, data } = req.body as RequestBody;

    if (data.length === 0) {
      responseJSON.error = "Nothing to sync";
      responseJSON.errorCode = "MISSING_DATA";
      return res.status(400).json(responseJSON);
    }

    console.log(JSON.stringify(data[0]));

    const measurementsConfig = await Measurements.find(
      { type: "auto" },
      { code: true, unit: true, _id: true },
    );

    const { datesObject, datesArray } = createDatesObject(
      data,
      measurementsConfig,
      MEASUREMENT_SOURCES.APPLE_HEALTH,
    );
    const measurementsToUpdate = createMeasurementsUpdateObject(
      datesArray,
      datesObject,
      usersID!,
      lastSyncDate,
    );

    await UsersDailyAutoMeasurements.bulkWrite(measurementsToUpdate);
    await Users.updateOne({ _id: usersID }, { lastSyncDate: new Date() });

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
