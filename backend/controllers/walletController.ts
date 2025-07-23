// controllers/walletController.ts
import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { sendMoneySchema } from "../validators/walletSchema";

const prisma = new PrismaClient();

export const getBalance = async (req: any, res: Response): Promise<void> => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.userId },
    });

    if (!wallet) {
      res.status(200).json({ balance: 0 });
      return;
    }

    res.status(200).json({ balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: "Error fetching balance", error: err });
  }
};

export const sendMoney = async (req: any, res: Response): Promise<void> => {
  const result = sendMoneySchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }
  const { recipientEmail, amount } = result.data;

  if (!recipientEmail || !amount || amount <= 0) {
    res.status(400).json({ message: "Invalid recipient or amount" });
    return;
  }

  try {
    const sender = await prisma.user.findUnique({ where: { id: req.userId } });
    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail },
    });

    if (!sender || !recipient) {
      res.status(404).json({ message: "Sender or recipient not found" });
      return;
    }

    const senderWallet = await prisma.wallet.findUnique({
      where: { userId: sender.id },
    });
    const recipientWallet = await prisma.wallet.findUnique({
      where: { userId: recipient.id },
    });

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

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.wallet.update({
        where: { userId: sender.id },
        data: { balance: { decrement: amount } },
      });

      await tx.wallet.update({
        where: { userId: recipient.id },
        data: { balance: { increment: amount } },
      });

      const debitTx = await tx.transaction.create({
        data: {
          fromId: sender.id,
          toId: recipient.id,
          amount,
          type: "debit",
          status: "success",
        },
      });

      const creditTx = await tx.transaction.create({
        data: {
          fromId: sender.id,
          toId: recipient.id,
          amount,
          type: "credit",
          status: "success",
        },
      });
    });

    res.status(200).json({ message: "Transaction successful" });
  } catch (error) {
    console.error("Transaction error", error);
    res.status(500).json({ message: "Transaction failed", error });
  }
};

export const getTransactions = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ fromId: req.userId }, { toId: req.userId }],
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(transactions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching transactions", error: err });
  }
};
