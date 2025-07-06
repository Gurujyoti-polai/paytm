import { Router, Request, Response } from "express";
import { signup, signin } from "../controllers/authController";
import { verifyToken, AuthRequest } from "../middleware/authMiddleware";
// console.log('signup controller:', signup);

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", verifyToken, (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  console.log("🎯 /me route hit by user:", req.userId);
  // res.json({ message: `Welcome, user ${userId}` });
  res.json({ userId: req.userId });
});

export default router;