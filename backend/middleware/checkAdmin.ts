import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const checkAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    if (!user || !user.isAdmin) {
      res.status(403).json({ message: "Access denied: Admins only" });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
