import { Router } from "express";
import controllers from "@controllers/index";

const router = Router();

router.route("/sync").post(controllers.measurements.appleHealth.postSyncAppleHealth);

export default router;
