// models/Wallet.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  balance: number;
  transactions: mongoose.Types.ObjectId[];
}

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IWallet>("Wallet", walletSchema);
