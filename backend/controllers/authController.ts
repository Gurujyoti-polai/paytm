import { Request, Response } from "express";
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import { PrismaClient } from "@prisma/client";
import { signInSchema, signUpSchema } from "../validators/authSchema";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

// signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  const result = signUpSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten().fieldErrors });
    return;
  }
  const { name, email, password, isAdmin } = result.data;
  console.log("Body:", result.data);
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      isAdmin,
    },
  });

  // Create wallet with 0 balance
  await prisma.wallet.create({
    data: {
      userId: newUser.id,
      balance: 0,
    },
  });
  res.status(201).json({ msg: "User created" });
};

// signin
export const signin = async (req: Request, res: Response): Promise<void> => {
  // ✅ Validate input using Zod
  const result = signInSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });

    return;
  }
  const { email, password } = result.data;
  console.log("Body in signIN:", result.data);
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400).json({ msg: "Invalid credentials" });
    return;
  }

  // console.log("Expires in:", );

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });
  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "lax", // or "strict" or "none" depending on need
      secure: false, // set true only in production with HTTPS
    })
    .json({
      user: { id: user.id, name: user.name, email: user.email },
      token: token,
    });

  console.log("Token after SignIn: ", token);
};
