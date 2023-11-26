// import { Response } from "express";
// import { logger } from "@logger/index";
// import { ExtendedRequest } from "@middlewares/checkAuth";
// import { UsersDailyCustomMeasurements } from "@models/users_daily_custom_measurments";
// import { Measurements } from "@models/measurements";
// import getStartOfDay from "@helpers/getStartOfTheDay";
//
// const postUpdateDailyEmotions = async (req: ExtendedRequest, res: Response) => {
//   const responseJSON = {
//     success: false,
//     error: "",
//     errorCode: "",
//   };
//   try {
//     const { mood, moodLevel, measurementCode, date } = req.body;
//     const { usersID } = req;
//
//     const timeOnStartOfTheDay = getStartOfDay(date);
//     const measurementInfo = await Measurements.findOne(
//       {
//         code: measurementCode,
//       },
//       { _id: true },
//     );
//
//     if (!measurementInfo) {
//       responseJSON.error = "Measurement not found";
//       responseJSON.errorCode = "INCORRECT_PARAMETER";
//       return res.status(404).json(responseJSON);
//     }
//
//     const userDailyMeasurement = await UsersDailyCustomMeasurements.findOne({
//       usersID,
//       date: timeOnStartOfTheDay,
//     });
//
//     const isMeasurementExists = userDailyMeasurement?.measurements.find(
//       (measurement) => measurement.code === measurementCode,
//     );
//     if (!userDailyMeasurement || !isMeasurementExists) {
//       await UsersDailyCustomMeasurements.updateOne(
//         {
//           usersID,
//           date: timeOnStartOfTheDay,
//         },
//         {
//           $set: {
//             lastUpdated: new Date(),
//           },
//           $push: {
//             measurements: {
//               code: measurementCode,
//               customFields: {
//                 mood,
//                 moodLevel,
//               },
//             },
//           },
//         },
//         { upsert: true },
//       );
//     } else {
//       await UsersDailyCustomMeasurements.updateOne(
//         {
//           usersID,
//           date: timeOnStartOfTheDay,
//           "measurements.code": measurementCode,
//         },
//         {
//           $set: {
//             lastUpdated: new Date(),
//             "measurements.$.code": measurementCode,
//             "measurements.$.customFields.mood": mood,
//             "measurements.$.customFields.moodLevel": moodLevel,
//           },
//         },
//         { upsert: true },
//       );
//     }
//
//     responseJSON.success = true;
//     return res.status(200).json(responseJSON);
//   } catch (e) {
//     logger.error(`Error at controllers/measurements/postUpdateDay: ${e}`);
//     responseJSON.error = "Something went wrong";
//     responseJSON.errorCode = "SOMETHING_WRONG";
//     return res.status(500).json(responseJSON);
//   }
// };
//
// export default postUpdateDailyEmotions;
