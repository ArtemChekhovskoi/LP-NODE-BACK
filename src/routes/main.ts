import { Router } from "express";
import controllers from "@controllers/index";

const router = Router();

router.route("/global-config").get(controllers.main.getGlobalConfig);
router.route("/push-notifications-config").get(controllers.main.getPushNotificationsConfig);

export default router;
