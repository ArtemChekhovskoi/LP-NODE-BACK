import { Router } from "express";
import controllers from "@controllers/index";
import { validateDTO } from "@middlewares/validateDTO";
import appleHealthRouter from "./appleHealth";
import {
	// updateAppleHealthSchema,
	updateDailyEmotionsSchema,
	updateDailyWeatherSchema,
	updateDailyNotesSchema,
	balanceEggConfigSchema,
	measurementsListSchema,
} from "../../dto/measurements";

const router = Router();

router.route("/measurements-list").get(validateDTO(measurementsListSchema, "query"), controllers.measurements.getMeasurementsList);
router.route("/daily-measurements").get(controllers.measurements.getDailyMeasurements);

router.route("/update-daily-emotions").post(validateDTO(updateDailyEmotionsSchema), controllers.measurements.postUpdateDailyEmotions);
router.route("/balance-egg-config").get(validateDTO(balanceEggConfigSchema, "query"), controllers.measurements.getBalanceEggConfig);
// router
//   .route("/update-apple-health")
//   .post(
//     validateDTO(updateAppleHealthSchema),
//     controllers.measurements.postUpdateAppleHealth,
//   );
router.route("/update-daily-weather").post(validateDTO(updateDailyWeatherSchema), controllers.measurements.postUpdateDailyWeather);
router.route("/update-notes").post(validateDTO(updateDailyNotesSchema), controllers.measurements.postUpdateDailyNotes);

// Apple Health
router.use("/apple-health", appleHealthRouter);
export default router;
