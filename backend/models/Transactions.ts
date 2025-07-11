// models/Transaction.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  from: mongoose.Types.ObjectId | null; // null if added by admin
  to: mongoose.Types.ObjectId | null; // null if withdrawal
  amount: number;
  type: "credit" | "debit";
  status: "success" | "failed";
  timestamp: Date;
  note?: string;
}

const transactionSchema = new Schema<ITransaction>(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
