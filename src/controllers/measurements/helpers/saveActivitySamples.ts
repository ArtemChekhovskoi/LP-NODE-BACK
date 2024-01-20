import getStartOfDay from "@helpers/getStartOfTheDay";
import { Types } from "mongoose";
import { UsersDailyActivity } from "@models/users_daily_activity";
import { MEASUREMENT_CODES } from "@constants/measurements";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";

const { ObjectId } = Types;

interface IActivitySample {
  activeEnergyBurned: number;
  activeEnergyBurnedGoal: number;
  appleExerciseTime: number;
  appleExerciseTimeGoal: number;
  appleStandHours: number;
  appleStandHoursGoal: number;
  date: string;
}

const saveActivitySamples = async (
  samples: IActivitySample[],
  usersID: string,
  measurementSource: string,
) => {
  const usersDailyActivityArray = samples.map((sample) => {
    const startOfDay = getStartOfDay(sample.date);
    return {
      updateOne: {
        filter: {
          usersID: new ObjectId(usersID),
          date: startOfDay,
        },
        update: {
          lastUpdated: new Date(),
          activeEnergyBurned: sample.activeEnergyBurned,
          exerciseTimeMinutes: sample.appleExerciseTime,
        },
        upsert: true,
      },
    };
  });
  const usersMeasurementsArray = samples.map((sample) => {
    const startOfDay = getStartOfDay(sample.date);
    return {
      updateOne: {
        filter: {
          usersID: new ObjectId(usersID),
          date: startOfDay,
          measurementCode: MEASUREMENT_CODES.ACTIVITY,
        },
        update: {
          lastUpdated: new Date(),
          value: sample.appleExerciseTime,
          source: measurementSource,
        },
        upsert: true,
      },
    };
  });

  await Promise.all([
    UsersDailyActivity.bulkWrite(usersDailyActivityArray),
    UsersDailyMeasurements.bulkWrite(usersMeasurementsArray),
  ]);
};

export { saveActivitySamples, IActivitySample };
