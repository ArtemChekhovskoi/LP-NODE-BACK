import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import getStartOfDay from "@helpers/getStartOfTheDay";
import { EmotionsConfig } from "@models/emotions_config";
import { UsersDailyEmotions } from "@models/users_daily_emotions";

const postUpdateDailyEmotions = async (req: ExtendedRequest, res: Response) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
  };
  try {
    const { emotionsID, date } = req.body;
    const { usersID } = req;

    const timeOnStartOfTheDay = getStartOfDay(date);

    const isEmotionExist = await EmotionsConfig.findOne(
      { _id: emotionsID },
      { _id: true },
    ).lean();
    if (!isEmotionExist) {
      responseJSON.error = "Emotion not found";
      responseJSON.errorCode = "NOT_FOUND";
      return res.status(404).json(responseJSON);
    }

    logger.info(
      `Updating daily emotions for user ${usersID}. Data: ${JSON.stringify(
        req.body,
      )}`,
    );

    await UsersDailyEmotions.updateOne(
      { usersID, date: timeOnStartOfTheDay },
      { emotionsID, lastUpdated: new Date() },
      { upsert: true },
    );

    responseJSON.success = true;
    return res.status(200).json(responseJSON);
  } catch (e) {
    logger.error(
      `Error at controllers/measurements/postUpdateDailyEmotions: ${e}`,
      e,
    );
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return res.status(500).json(responseJSON);
  }
};

export default postUpdateDailyEmotions;
