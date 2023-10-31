import { Types } from "mongoose";
import { IDatesObject } from "@controllers/measurements/helpers/createDatesObject";

const createMeasurementsUpdateObject = (
  datesArray: string[],
  datesObject: { [key: string]: IDatesObject[] },
  usersID: string,
  lastSyncDate: string,
) => {
  const measurementsToUpdate = datesArray.map((date) => {
    const dateMeasurements = datesObject[date];
    const bulkObject = {
      updateOne: {
        filter: {
          usersID: new Types.ObjectId(usersID),
          date: new Date(date),
        },
        update: {
          $set: {
            lastUpdated: new Date(lastSyncDate),
          },
          $push: {
            measurements: {
              $each: dateMeasurements,
            },
          },
        },
        upsert: true,
      },
    };
    return bulkObject;
  });
  return measurementsToUpdate;
};

export default createMeasurementsUpdateObject;
