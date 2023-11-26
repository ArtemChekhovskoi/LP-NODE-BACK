import { Router } from "express";
import controllers from "@controllers/index";

const router = Router();

router
  .route("/user-notifications")
  .get(controllers.notifications.getUserNotifications);

export default router;
