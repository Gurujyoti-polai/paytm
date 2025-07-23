import { z } from "zod";

export const sendMoneySchema = z.object({
  recipientEmail: z.string().email("Invalid recipient email"),
  amount: z.number().positive("Amount must be a positive number"),
});
