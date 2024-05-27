import { Router } from "express";
import controllers from "@controllers/index";

const router = Router();

router.route("/verify-access-token").post(controllers.auth.postVerifyAccessToken);

export default router;
