import * as yup from "yup";
import { dateValidation } from "./commonMethods";

const updateDailyEmotionsSchema = yup.object({
  date: dateValidation().required(),
  emotionsID: yup.string().required(),
});

const updateDailyWeatherSchema = yup.object({
  long: yup.number().required(),
  lat: yup.number().required(),
});

const updateAppleHealthSchema = yup.object({
  lastSyncDate: yup.string().required(),
  data: yup.array().of(
    yup.object().shape({
      // @ts-ignore
      [yup.string()]: yup.array().of(
        yup.object().shape({
          startDate: yup.string().required(),
          endDate: yup.string().required(),
          value: yup.number().required(),
        }),
      ),
    }),
  ),
});

const updateDailyNotesSchema = yup.object({
  notes: yup.string().required(),
  date: dateValidation().required(),
});

const balanceEggConfigSchema = yup.object({
  startDate: dateValidation().required(),
  endDate: dateValidation().required(),
});

const measurementsListSchema = yup.object({
  startDate: dateValidation().required(),
  endDate: dateValidation().required(),
});

export {
  updateDailyEmotionsSchema,
  updateDailyWeatherSchema,
  updateDailyNotesSchema,
  balanceEggConfigSchema,
  measurementsListSchema,
  updateAppleHealthSchema,
};
