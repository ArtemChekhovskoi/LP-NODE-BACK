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

const saveMorningReflectionSchema = yup.object({
	sleepQuality: yup.number().min(1).max(5).required(),
});

const saveEveningReflectionSchema = yup.object({
	emotionsID: yup.string(),
	notes: yup.string(),
	activityFeeling: yup.number().min(1).max(5),
});

export {
	updateDailyEmotionsSchema,
	updateDailyWeatherSchema,
	updateDailyNotesSchema,
	balanceEggConfigSchema,
	measurementsListSchema,
	saveEveningReflectionSchema,
	saveMorningReflectionSchema,
};
