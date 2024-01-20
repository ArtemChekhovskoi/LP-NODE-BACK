import { Router } from "express";
import controllers from "@controllers/index";
import { validateDTO } from "@middlewares/validateDTO";
import { postUpdateNotificationStatusSchema } from "../dto/notifications";

const router = Router();

router
  .route("/user-notifications")
  .get(controllers.notifications.getUserNotifications);
router
  .route("/update-notification-status")
  .post(
    validateDTO(postUpdateNotificationStatusSchema),
    controllers.notifications.postUpdateNotificationStatus,
  );
export default router;
