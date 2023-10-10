import { Router } from "express";
import controllers from "../../controllers";

const router = Router();

router.route("/google-signin").post(controllers.user.postGoogleSignIn);
router.route("/logout").post(controllers.user.postLogOut);
router.route("/update-gender").post(controllers.user.postUpdateGender);
router.route("/update-location").post(controllers.user.postUpdateLocation);
router
  .route("/update-apps-connected")
  .post(controllers.user.postUpdateAppsConnected);

export default router;
