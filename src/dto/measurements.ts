import * as yup from "yup";
import { dateValidation } from "./commonMethods";

const updateDailyMoodSchema = yup.object({
  mood: yup.string().required(),
  moodLevel: yup.number().required().min(0).max(100),
  date: yup.string().required(),
  measurementCode: yup.string().required(),
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

const listSchema = yup.object({
  startDate: dateValidation().required(),
  endDate: dateValidation().required(),
});

export { updateDailyMoodSchema, listSchema, updateAppleHealthSchema };
