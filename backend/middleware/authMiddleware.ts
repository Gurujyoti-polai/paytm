import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("🔍 DEBUG: All request headers:", req.headers);
  console.log("🍪 DEBUG: All cookies received:", req.cookies);
  console.log("🍪 DEBUG: Raw cookie header:", req.headers.cookie);

  // Check for token in Authorization header first
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log("🔑 Token found in Authorization header:", token);
  } else {
    // Fall back to cookie
    token = req.cookies.token;
    console.log("🍪 Token found in cookie:", token);
  }

  console.log("Inside entering middleware");
  console.log("🔒 Incoming Request with Token:", token);

  if (!token) {
    console.log("❌ No token found in either Authorization header or cookies");
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    req.userId = decoded.id;
    console.log("Inside middleware");
    console.log("Now userId", req.userId);
    console.log("✅ Token verified. User ID:", decoded.id);
    next();
  } catch (error) {
    console.log("⛔ Invalid token:", error);
    res.status(403).json({ message: "Invalid token" });
  }
};
