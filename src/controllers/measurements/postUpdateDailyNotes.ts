import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import getStartOfDay from "@helpers/getStartOfTheDay";
import { UsersDailyCustomMeasurements } from "@models/users_daily_custom_measurments";

const postUpdateDailyNotes = async (req: ExtendedRequest, res: Response) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
  };
  try {
    const { notes, date } = req.body;
    const { usersID } = req;

    const startOfTheDate = getStartOfDay(new Date(date));
    await UsersDailyCustomMeasurements.updateOne(
      {
        usersID,
        date: startOfTheDate,
      },
      {
        $set: {
          lastUpdated: new Date(),
        },
        $push: {
          measurements: {
            code: "notes",
            customFields: {
              notes,
            },
          },
        },
      },
      { upsert: true },
    );
    return res.status(200).json(responseJSON);
  } catch (e) {
    logger.error(
      `Error at controllers/measurements/postUpdateDailyNotes: ${e}`,
    );
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return res.status(500).json(responseJSON);
  }
};

export default postUpdateDailyNotes;
