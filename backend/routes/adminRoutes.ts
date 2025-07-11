import express from "express";
import { getAllUsersWithTransactions } from "../controllers/adminController";
import { verifyToken } from "../middleware/authMiddleware";
import { checkAdmin } from "../middleware/checkAdmin";

const router = express.Router();

router.get("/users", verifyToken, checkAdmin, getAllUsersWithTransactions);

export default router;
