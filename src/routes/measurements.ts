import { Router } from "express";
import controllers from "@controllers/index";
import { validateDTO } from "@middlewares/validateDTO";
import { updateDailyMoodSchema } from "../dto/measurements";

const router = Router();

router.route("/list").get(controllers.measurements.getList);
router.route("/empty-days").get(controllers.measurements.getEmptyDays);

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

export default router;
