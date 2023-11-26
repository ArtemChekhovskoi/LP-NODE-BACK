import getStartOfDay from "@helpers/getStartOfTheDay";
import { HealthValue } from "@controllers/measurements/postUpdateAppleHealth";
import { Types } from "mongoose";

interface IMeasurementsConfig {
  code: string;
  unit: string;
  _id: Types.ObjectId;
}

export interface IMeasurementObject {
  measurementID?: Types.ObjectId;
  unit?: string;
  date: string;
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
  const measurementsArray: IMeasurementObject[] = [];

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      item[key].forEach((measurement) => {
        const date = getStartOfDay(measurement.startDate).toISOString();
        if (measurementsCodesArray.includes(key)) {
          const { unit } =
            measurementsConfig.find(({ code }) => code === key) || {};
          measurementsArray.push({
            unit,
            date,
            code: key,
            value: measurement.value,
            source: measurementSource,
          });
        }
      });
    });
  });
  return measurementsArray;
};

export default createDatesObject;
