import { Router } from "express";
import { checkAuth } from "@middlewares/checkAuth";

import notifications from "@routes/notifications";
import userRouter from "@routes/user";
import measurementsRouter from "@routes/measurements";
import patterns from "@routes/patterns";
import main from "@routes/main";

const router = Router();

router.use((req, res, next) => {
	res.setHeader("Content-Type", "application/json");
	return next();
});
router.use(checkAuth);

router.use("/user", userRouter);
router.use("/measurements", measurementsRouter);
router.use("/notifications", notifications);
router.use("/patterns", patterns);
router.use("/main", main);
router.use("/health-check", (req, res) => res.status(200).json({ success: true }));

export default router;
