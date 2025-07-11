import { Request, Response, NextFunction } from "express";
import { User } from "../models/Users";

export const checkAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      res.status(403).json({ message: "Access denied: Admins only" });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
