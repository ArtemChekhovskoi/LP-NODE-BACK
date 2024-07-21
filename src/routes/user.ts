import { Router } from "express";
import controllers from "@controllers/index";
import { validateDTO } from "@middlewares/validateDTO";
import {
	postGoogleSignInSchema,
	postUpdateAppsConnectedSchema,
	postUpdateGenderSchema,
	postUpdateLastSyncDateSchema,
	postUpdateRegistrationStepSchema,
} from "../dto/users";

const router = Router();

router.route("/profile").get(controllers.user.getProfile);
router.route("/sync-status").get(controllers.user.getSyncStatus);

router.route("/google-signin").post(validateDTO(postGoogleSignInSchema), controllers.user.postGoogleSignIn);
router.route("/logout").post(controllers.user.postLogOut);
router.route("/update-gender").post(validateDTO(postUpdateGenderSchema), controllers.user.postUpdateGender);
router.route("/update-apps-connected").post(validateDTO(postUpdateAppsConnectedSchema), controllers.user.postUpdateAppsConnected);
router.route("/update-registration-step").post(validateDTO(postUpdateRegistrationStepSchema), controllers.user.postUpdateRegistrationStep);
router.route("/update-last-sync-date").post(validateDTO(postUpdateLastSyncDateSchema), controllers.user.postUpdateLastSyncDate);
router.route("/save-push-token").post(controllers.user.postSavePushToken);
router.route("/update-push-subscriptions").post(controllers.user.postUpdatePushSubscriptions);

export default router;
