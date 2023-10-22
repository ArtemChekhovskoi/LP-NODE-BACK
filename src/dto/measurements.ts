import * as yup from "yup";

const updateDailyMoodSchema = yup.object({
  mood: yup.string().required(),
  moodLevel: yup.number().required().min(0).max(100),
  date: yup.string().required(),
  measurementCode: yup.string().required(),
});

export { updateDailyMoodSchema };
