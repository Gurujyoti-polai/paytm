import { Request, Response } from "express";
// import { User } from "../models/Users";
// import Wallet from "../models/Wallet";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllUsersWithTransactions = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const isAdmin = req.isAdmin;

    if (!isAdmin) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    const users = await prisma.user.findMany({
      include: {
        wallet: true,
        sentTransactions: true,
        receivedTransactions: true,
      },
    });

    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch users and transactions", error: err });
  }
};
