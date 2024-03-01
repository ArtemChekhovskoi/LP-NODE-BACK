import { Router } from "express";
import controllers from "@controllers/index";
import { validateDTO } from "@middlewares/validateDTO";
import appleHealthRouter from "./appleHealth";
import {
	updateDailyEmotionsSchema,
	updateDailyWeatherSchema,
	updateDailyNotesSchema,
	balanceEggConfigSchema,
	measurementsListSchema,
	saveMorningReflectionSchema,
	saveEveningReflectionSchema,
} from "../../dto/measurements";

const router = Router();

router.route("/measurements-list").get(validateDTO(measurementsListSchema, "query"), controllers.measurements.getMeasurementsList);
router.route("/daily-measurements").get(controllers.measurements.getDailyMeasurements);
router.route("/balance-egg-config").get(validateDTO(balanceEggConfigSchema, "query"), controllers.measurements.getBalanceEggConfig);
router.route("/daily-heart-rate-dependencies").get(controllers.measurements.getDailyHeartRateDependencies);

router.route("/update-daily-emotions").post(validateDTO(updateDailyEmotionsSchema), controllers.measurements.postUpdateDailyEmotions);
router.route("/update-daily-weather").post(validateDTO(updateDailyWeatherSchema), controllers.measurements.postUpdateDailyWeather);
router.route("/update-notes").post(validateDTO(updateDailyNotesSchema), controllers.measurements.postUpdateDailyNotes);
router.route("/save-morning-reflection").post(validateDTO(saveMorningReflectionSchema), controllers.measurements.postSaveMorningReflection);
router.route("/save-evening-reflection").post(validateDTO(saveEveningReflectionSchema), controllers.measurements.postSaveEveningReflection);

// Apple Health
router.use("/apple-health", appleHealthRouter);
export default router;
