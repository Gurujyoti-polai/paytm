import express from "express";
import {
  getBalance,
  sendMoney,
  getTransactions,
} from "../controllers/walletController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

// GET /api/wallet/balance
router.get("/balance", verifyToken, getBalance);

// POST /api/wallet/send
router.post("/send", verifyToken, sendMoney);

// GET /api/wallet/transactions
router.get("/transactions", verifyToken, getTransactions);

export default router;
