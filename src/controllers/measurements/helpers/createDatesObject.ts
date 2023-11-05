import getStartOfDay from "@helpers/getStartOfTheDay";
import { HealthValue } from "@controllers/measurements/postUpdateAppleHealth";
import { Types } from "mongoose";

interface IMeasurementsConfig {
  code: string;
  unit: string;
  _id: Types.ObjectId;
}

export interface IDatesObject {
  measurementID?: Types.ObjectId;
  unit?: string;
  code: string;
  value: number;
  source: string;
}
const createDatesObject = (
  data: Array<{ [key: string]: HealthValue[] }>,
  measurementsConfig: IMeasurementsConfig[],
  measurementSource: string,
) => {
  const measurementsCodesArray = measurementsConfig.map((item) => item.code);
  const datesObject: { [key: string]: IDatesObject[] } = {};
  const datesArray: string[] = [];

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      item[key].forEach((measurement) => {
        const date = getStartOfDay(measurement.startDate).toISOString();
        if (!datesObject[date]) {
          datesObject[date] = [];
          datesArray.push(date);
        }
        if (measurementsCodesArray.includes(key)) {
          const { unit } =
            measurementsConfig.find(({ code }) => code === key) || {};
          datesObject[date].push({
            unit,
            code: key,
            value: measurement.value,
            source: measurementSource,
          });
        }
      });
    });
  });
  return { datesObject, datesArray };
};

export default createDatesObject;
