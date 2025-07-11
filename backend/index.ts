import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import connectDB from "./config/db";
import { AuthRequest, verifyToken } from "./middleware/authMiddleware";
import walletRoutes from "./routes/walletRoutes";
import adminRoutes from "./routes/adminRoutes";

connectDB();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);
// ✅ Your protected test route here
app.get("/api/me", verifyToken, (req: AuthRequest, res: Response) => {
  // console.log("Now entering middleware");
  res.json({ userId: req.userId });
});

app.use("/api/wallet", verifyToken, walletRoutes);
app.use("/api/admin", adminRoutes);

app.listen(process.env.PORT || 5001, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
