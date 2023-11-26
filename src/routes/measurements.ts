import { Router } from "express";
import controllers from "@controllers/index";
import { validateDTO } from "@middlewares/validateDTO";
import {
  updateAppleHealthSchema,
  // updateDailyMoodSchema,
  updateDailyWeatherSchema,
  updateDailyNotesSchema,
  balanceEggConfigSchema,
  measurementsListSchema,
} from "../dto/measurements";

const router = Router();

router
  .route("/measurements-list")
  .get(
    validateDTO(measurementsListSchema, "query"),
    controllers.measurements.getMeasurementsList,
  );

// router
//   .route("/update-mood")
//   .post(
//     validateDTO(updateDailyMoodSchema),
//     controllers.measurements.postUpdateDailyEmotions,
//   );
router
  .route("/balance-egg-config")
  .get(
    validateDTO(balanceEggConfigSchema, "query"),
    controllers.measurements.getBalanceEggConfig,
  );
router
  .route("/update-apple-health")
  .post(
    validateDTO(updateAppleHealthSchema),
    controllers.measurements.postUpdateAppleHealth,
  );
router
  .route("/update-daily-weather")
  .post(
    validateDTO(updateDailyWeatherSchema),
    controllers.measurements.postUpdateDailyWeather,
  );
router
  .route("/update-notes")
  .post(
    validateDTO(updateDailyNotesSchema),
    controllers.measurements.postUpdateDailyNotes,
  );

export default router;
