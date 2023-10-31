import { Router } from "express";
import controllers from "@controllers/index";
import { validateDTO } from "@middlewares/validateDTO";
import {
  listSchema,
  updateAppleHealthSchema,
  updateDailyMoodSchema,
} from "../dto/measurements";

const router = Router();

router
  .route("/list")
  .get(validateDTO(listSchema, "query"), controllers.measurements.getList);

router
  .route("/update-mood")
  .post(
    validateDTO(updateDailyMoodSchema),
    controllers.measurements.postUpdateDailyMood,
  );
router.route("/update-pain").post(controllers.measurements.postUpdateDailyPain);
router
  .route("/update-feeling")
  .post(controllers.measurements.postUpdateDailyFeeling);
router
  .route("/update-apple-health")
  .post(
    validateDTO(updateAppleHealthSchema),
    controllers.measurements.postUpdateAppleHealth,
  );

export default router;
