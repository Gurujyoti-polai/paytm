import { Request, Response } from 'express';
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import { User } from '../models/Users'
const { model } = require("mongoose");

const JWT_SECRET = process.env.JWT_SECRET;

// signup
export const signup = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400).json({ msg: 'user already exists' });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ msg: 'User created' });
};

// signin
export const signin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(400).json({ msg: 'Invalid credentials' });
        return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400).json({ msg: 'Invalid credentials' });
        return;
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: 'Id' });
    // res.json({ token, user: { id: user._id, username: user.username, email: user.email } })
}