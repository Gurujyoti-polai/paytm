import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export const generateTokens = (payload: object) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => jwt.verify(token, process.env.JWT_SECRET!);
export const verifyRefreshToken = (token: string) => jwt.verify(token, process.env.REFRESH_SECRET!);