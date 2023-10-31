import { Router } from "express";
import controllers from "@controllers/index";
import { validateDTO } from "@middlewares/validateDTO";
import {
  postGoogleSignInSchema,
  postUpdateAppsConnectedSchema,
  postUpdateGenderSchema,
  postUpdateLocationSchema,
  postUpdateRegistrationStepSchema,
} from "../dto/users";

const router = Router();

router.route("/profile").get(controllers.user.getProfile);

router
  .route("/google-signin")
  .post(validateDTO(postGoogleSignInSchema), controllers.user.postGoogleSignIn);
router.route("/logout").post(controllers.user.postLogOut);
router
  .route("/update-gender")
  .post(validateDTO(postUpdateGenderSchema), controllers.user.postUpdateGender);
router
  .route("/update-location")
  .post(
    validateDTO(postUpdateLocationSchema),
    controllers.user.postUpdateLocation,
  );
router
  .route("/update-apps-connected")
  .post(
    validateDTO(postUpdateAppsConnectedSchema),
    controllers.user.postUpdateAppsConnected,
  );
router
  .route("/update-registration-step")
  .post(
    validateDTO(postUpdateRegistrationStepSchema),
    controllers.user.postUpdateRegistrationStep,
  );

export default router;
