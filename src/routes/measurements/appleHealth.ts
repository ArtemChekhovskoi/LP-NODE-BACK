import { Router } from "express";
import controllers from "@controllers/index";

const router = Router();

router.route("/update-height").post(controllers.measurements.appleHealth.postUpdateHeight);
router.route("/update-weight").post(controllers.measurements.appleHealth.postUpdateWeight);
router.route("/update-sleep").post(controllers.measurements.appleHealth.postUpdateSleep);
router.route("/update-heart-rate").post(controllers.measurements.appleHealth.postUpdateHeartRate);
router.route("/update-walking-running-distance").post(controllers.measurements.appleHealth.postUpdateWalkingRunningDistance);
router.route("/update-steps").post(controllers.measurements.appleHealth.postUpdateSteps);

export default router;
