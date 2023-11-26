import { Response } from "express";
import { Types } from "mongoose";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { Measurements } from "@models/measurements";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";
import { UsersDailyEmotions } from "@models/users_daily_emotions";
import { UsersDailyNotes } from "@models/users_daily_notes";

import generateDatesArray from "@helpers/generateDatesArray";
import { IResponseWithData } from "@controllers/controllers.interface";

interface RequestQuery {
  startDate: string;
  endDate: string;
}

interface IResponseData {
  date: Date;
  [key: string]: unknown;
}
const getList = async (req: ExtendedRequest, res: Response) => {
  const responseJSON: IResponseWithData<IResponseData[]> = {
    success: false,
    error: "",
    errorCode: "",
    data: [],
  };
  try {
    const { usersID } = req;
    const { startDate, endDate } = req.query as unknown as RequestQuery;

    const measurementsConfig = await Measurements.find(
      { active: true, isUsedOnMainScreen: true },
      { code: true, unit: true, _id: true },
    ).lean();

    const codesArray = measurementsConfig.map((item) => item.code);
    const filter = {
      usersID: new Types.ObjectId(usersID),
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    const [usersAutoMeasurements, usersEmotions, usersDailyNotes] =
      await Promise.all([
        await UsersDailyMeasurements.find(
          { ...filter, measurementCode: { $in: codesArray } },
          {
            date: true,
            measurementCode: true,
            value: true,
          },
        )
          .lean()
          .sort({ date: 1 }),
        await UsersDailyEmotions.find(filter, {
          emotionsID: true,
          date: true,
          _id: false,
        })
          .lean()
          .sort({ date: 1 }),
        await UsersDailyNotes.find(filter, {
          notes: true,
          date: true,
          _id: false,
        })
          .lean()
          .sort({ date: 1 }),
      ]);

    const datesArray = generateDatesArray(startDate, endDate);
    const data = datesArray.map((date) => {
      const dateObject: IResponseData = {
        date,
        emotion: "",
        notes: "",
      };

      const usersAutoMeasurementsByDate = usersAutoMeasurements.filter(
        (item) => item.date.toISOString() === date.toISOString(),
      );
      const usersEmotionByDate = usersEmotions.find(
        (item) => item.date.toISOString() === date.toISOString(),
      );
      const usersDailyNoteByDate = usersDailyNotes.find(
        (item) => item.date.toISOString() === date.toISOString(),
      );

      if (usersAutoMeasurementsByDate.length) {
        usersAutoMeasurementsByDate.forEach((item) => {
          dateObject[item.measurementCode] = item.value;
        });
      }
      if (usersEmotionByDate) {
        dateObject.emotion = usersEmotionByDate.emotionsID;
      }
      if (usersDailyNoteByDate) {
        dateObject.notes = usersDailyNoteByDate.notes;
      }

      return dateObject;
    });

    responseJSON.data = data;
    responseJSON.success = true;
    return res.status(200).json(responseJSON);
  } catch (e) {
    logger.error(`Error at controllers/measurements/getMeasurementsList: ${e}`);
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return res.status(500).json(responseJSON);
  }
};

export default getList;
