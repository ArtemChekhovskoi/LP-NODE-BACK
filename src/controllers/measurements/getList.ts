import { Response } from "express";
import { Types } from "mongoose";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { UsersDailyCustomMeasurements } from "@models/users_daily_custom_measurments";
import { UsersDailyAutoMeasurements } from "@models/users_daily_auto_measurements";

interface RequestQuery {
  startDate: string;
  endDate: string;
}
const getList = async (req: ExtendedRequest, res: Response) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
    data: [] as unknown[],
  };
  try {
    const { usersID } = req;
    const { startDate, endDate } = req.query as unknown as RequestQuery;

    const filter = {
      usersID: new Types.ObjectId(usersID),
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    const pipeline = [
      {
        $match: filter,
      },
      {
        $unwind: "$measurements",
      },
      {
        $group: {
          _id: "$date",
          date: { $first: "$date" },
          measurements: {
            $push: {
              k: "$measurements.code",
              v: {
                value: "$measurements.value",
                unit: "$measurements.unit",
                customFields: "$measurements.customFields",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: 1,
          measurements: {
            $arrayToObject: "$measurements",
          },
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ];
    const [customMeasurements, autoMeasurements] = await Promise.all([
      // @ts-ignore
      UsersDailyCustomMeasurements.aggregate(pipeline),
      // @ts-ignore
      UsersDailyAutoMeasurements.aggregate(pipeline),
    ]);

    if (!autoMeasurements.length && !customMeasurements.length) {
      responseJSON.success = true;
      return res.status(200).json(responseJSON);
    }

    const totalDatesMeasurements = autoMeasurements.map((item) => {
      const customMeasurement = customMeasurements.find(
        (customItem) => customItem.date.getTime() === item.date.getTime(),
      );
      if (customMeasurement) {
        return {
          date: item.date,
          measurements: {
            ...item.measurements,
            ...customMeasurement.measurements,
          },
        };
      }
      return item;
    });

    responseJSON.data = totalDatesMeasurements;
    responseJSON.success = true;
    return res.status(200).json(responseJSON);
  } catch (e) {
    logger.error(`Error at controllers/measurements/getList: ${e}`);
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return res.status(500).json(responseJSON);
  }
};

export default getList;
