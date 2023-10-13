import { Router } from "express";
import { checkAuth } from "@middlewares/checkAuth";
import userRouter from "./user";

const router = Router();

router.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  return next();
});

router.use(checkAuth);
router.use("/user", userRouter);
router.use("/health-check", (req, res) =>
  res.status(200).json({ success: true }),
);

export default router;
