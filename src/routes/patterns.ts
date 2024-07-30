import { Router } from "express";
import controllers from "@controllers/index";
import { validateDTO } from "@middlewares/validateDTO";
import { getPatternsListSchema } from "../dto/patterns";

const router = Router();

router.route("/patterns-list").get(validateDTO(getPatternsListSchema, "query"), controllers.patterns.getPatternsList);
router.route("/prepared-patterns").get(controllers.patterns.getPreparedPatterns);

router.route("/rate-pattern").post(controllers.patterns.postRatePattern);
router.route("/mark-pattern-viewed").post(controllers.patterns.postMarkPatternAsViewed);

export default router;
