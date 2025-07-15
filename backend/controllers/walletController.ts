// controllers/walletController.ts
import { Request, Response } from "express";
import Wallet from "../models/Wallet";
import Transaction from "../models/Transactions";
import { User } from "../models/Users";
import mongoose, { Types } from "mongoose";

export const getBalance = async (req: any, res: Response): Promise<void> => {
  let wallet = await Wallet.findOne({ user: req.userId });
  console.log("Inside getBalance");
  if (!wallet) {
    wallet = await Wallet.create({ user: req.userId, balance: 0 });
    console.log("wallet is initialized", wallet);
  }
  console.log("This the balance ", wallet.balance);
  res.json({ balance: wallet.balance });
};

export const sendMoney = async (req: any, res: Response): Promise<void> => {
  try {
    const { recipientEmail, amount } = req.body;

    if (!recipientEmail || !amount || amount <= 0) {
      res.status(400).json({ message: "Invalid recipient or amount" });
      return;
    }

    const sender = await User.findById(req.userId);
    console.log("The sender: ", sender?.email);

    if (!sender) {
      res.status(404).json({ message: "Sender not found" });
      return;
    }

    const recipient = await User.findOne({ email: recipientEmail });
    console.log("The reciver: ", recipient?.email);

    if (!recipient) {
      res.status(404).json({ message: "Recipient not found" });
      return;
    }

    console.log("Sender ID: ", sender._id);
    console.log("Recipient ID: ", recipient._id);

    const senderWallet = await Wallet.findOne({ user: sender._id });
    let recipientWallet = await Wallet.findOne({ user: recipient._id });

    console.log("Recipient full object:", recipient);
    console.log("typeof recipient:", typeof recipient);
    console.log("typeof recipient._id:", typeof recipient._id);

    if (!recipientWallet) {
      console.log("🧾 Creating wallet for recipient:", recipient._id);

      recipientWallet = await Wallet.create({
        user: recipient._id, // Keep as ObjectId
        balance: 0,
      });

      console.log("✅ Created recipient wallet:", recipientWallet);
    }

    console.log("Sender money: ", senderWallet);
    console.log("Reciever money: ", recipientWallet);

    if (!senderWallet || !recipientWallet) {
      res
        .status(404)
        .json({ message: "Wallet not found for sender or recipient" });
      return;
    }

    if (senderWallet.balance < amount) {
      res.status(400).json({ message: "Insufficient balance" });
      return;
    }

    senderWallet.balance -= amount;
    recipientWallet.balance += amount;

    await senderWallet.save();
    await recipientWallet.save();

    const [senderTx, recipientTx] = await Transaction.create([
      {
        from: sender._id,
        to: recipient._id,
        amount,
        type: "debit",
        status: "success",
      },
      {
        from: sender._id,
        to: recipient._id,
        amount,
        type: "credit",
        status: "success",
      },
    ]);

    senderWallet.transactions.push(senderTx._id as Types.ObjectId);
    recipientWallet.transactions.push(recipientTx._id as Types.ObjectId);

    await senderWallet.save();
    await recipientWallet.save();

    res.status(200).json({ message: "Transaction successful" });
  } catch (error) {
    console.error("💥 Transaction Error:", error);
    res.status(500).json({ message: "Transaction failed", error });
  }
};

export const getTransactions = async (
  req: any,
  res: Response
): Promise<void> => {
  // console.log("Inside getTransaction");

  const wallet = await Wallet.findOne({ user: req.userId }).populate(
    "transactions"
  );
  if (!wallet) {
    res.status(404).json({ message: "Wallet not found" });
    return;
  }

  res.json({ transactions: wallet.transactions });
};
