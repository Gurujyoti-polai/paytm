import { Request, Response } from "express";
import { User } from "../models/Users";
import Wallet from "../models/Wallet";

export const getAllUsersWithTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find().select("-password"); // Don't send password

    const data = await Promise.all(
      users.map(async (user) => {
        const wallet = await Wallet.findOne({ user: user._id }).populate(
          "transactions"
        );
        return {
          user,
          wallet,
        };
      })
    );

    res.status(200).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch users and transactions", error: err });
  }
};
