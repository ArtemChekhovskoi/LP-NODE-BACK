import { Router } from "express";
import controllers from "@controllers/index";

const router = Router();

router.route("/global-config").get(controllers.main.getGlobalConfig);

export default router;
