import dayjs from "dayjs";
import getStartOfDay from "@helpers/getStartOfTheDay";
import { UsersDailySleep } from "@models/users_daily_sleep";
import { Types } from "mongoose";
import { MEASUREMENT_CODES } from "@constants/measurements";
import { UsersDailyMeasurements } from "@models/users_daily_measurements";

const { ObjectId } = Types;

type SleepType = "ASLEEP" | "INBED" | "AWAKE";
interface ISleepSample {
  startDate: Date;
  endDate: Date;
  value: SleepType;
}

const getSleepInfo = (sleepStartDate: Date, sleepEndDate: Date) => {
  const startDate = dayjs(sleepStartDate);
  const endDate = dayjs(sleepEndDate);
  const cutoffHour = 5;

  const assignDate =
    startDate.hour() < cutoffHour ? startDate : startDate.add(1, "day");
  const startOfDay = getStartOfDay(assignDate.toISOString());
  const durationMinutes = endDate.diff(startDate, "minutes");

  return { startOfDay, durationMinutes };
};
const saveSleepSamples = async (
  samples: ISleepSample[],
  usersID: string,
  measurementSource: string,
) => {
  const usersDailySleepArray = samples.map((sample) => {
    const { startOfDay, durationMinutes } = getSleepInfo(
      sample.startDate,
      sample.endDate,
    );
    return {
      updateOne: {
        filter: {
          ...sample,
          usersID: new ObjectId(usersID),
          date: startOfDay,
          durationMinutes,
        },
        update: {
          lastUpdated: new Date(),
        },
        upsert: true,
      },
    };
  });
  const usersMeasurementsArray = samples.map((sample) => {
    const { startOfDay, durationMinutes } = getSleepInfo(
      sample.startDate,
      sample.endDate,
    );
    return {
      updateOne: {
        filter: {
          usersID: new ObjectId(usersID),
          date: startOfDay,
          measurementCode: MEASUREMENT_CODES.SLEEP,
        },
        update: {
          lastUpdated: new Date(),
          value: durationMinutes,
          source: measurementSource,
        },
        upsert: true,
      },
    };
  });

  await Promise.all([
    UsersDailySleep.bulkWrite(usersDailySleepArray),
    UsersDailyMeasurements.bulkWrite(usersMeasurementsArray),
  ]);
};

export { saveSleepSamples, SleepType, ISleepSample };
