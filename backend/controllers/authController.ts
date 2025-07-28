import { Request, Response } from "express";
import redis from "../redis/redisClient";
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import { PrismaClient } from "@prisma/client";
import { signInSchema, signUpSchema } from "../validators/authSchema";
import { generateKey } from "crypto";
import { generateTokens, verifyRefreshToken } from "../utils/jwt";

const prisma = new PrismaClient();
const JWT_REFRESH_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

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

  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    isAdmin: user.isAdmin,
  });

  // Store refresh token in Redis
  await redis.set(user.id, refreshToken, "EX", JWT_REFRESH_EXPIRY_SECONDS);
  console.log("🚀 Redis set for user ID:", user.id);

  // console.log("inside signIN if there is refresh token ot not", req.cookies.refreshToken);

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: JWT_REFRESH_EXPIRY_SECONDS * 1000,
    })
    .json({
      message: "Login Successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    });
};

// refresh token is generated
export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("inside refersh token");

  const token = req.cookies.refreshToken;
  if (!token) {
    res.status(401).json({ message: "No refresh token" });
    return;
  }
  console.log("inside refresh token1 ", token);

  try {
    const payload: any = verifyRefreshToken(token);
    const storedToken = await redis.get(payload.id);

    if (storedToken !== token) {
      {
        res.status(403).json({ message: "Invalid refresh token" });
        return;
      }
    }

    const tokens = generateTokens({ id: payload.id, isAdmin: payload.isAdmin });
    console.log("inside refresh token: ", token);

    await redis.set(payload.id, tokens.refreshToken, "EX", 7 * 24 * 60 * 60);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.json({ accessToken: tokens.accessToken });
    return;
  } catch (err) {
    res.status(403).json({ message: "Refresh token expired or invalid" });
    return;
  }
};

// logout
export const signout = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken;
  try {
    const payload: any = verifyRefreshToken(token);
    const redisDeleteResult = await redis.del(payload.id);
    console.log("Redis delete result:", redisDeleteResult); // should be 1 if successful
  } catch (e) {
    console.error("Failed to delete refresh token from Redis:", e);
  }

  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
  return;
};
