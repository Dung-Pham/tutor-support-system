/**
 * File: authController.ts
 * Mục đích: Controller xử lý authentication (SQL Server)
 */

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User, Session } from "../models/sql/index.js";
import { JwtPayload } from "../types/auth.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface SignInBody {
  email: string;
  password: string;
}

interface RefreshTokenRequest extends Request {
  cookies: {
    refreshToken?: string;
  };
}

// Student Registration
export const registerStudent = async (
  req: Request<object, object, RegisterBody>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const duplicate = await User.findOne({ where: { email } });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      hashedPassword,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      role: "student",
    });

    return res.status(201).json({
      success: true,
      message: "Student account created successfully",
    });
  } catch (error) {
    console.error("Error in registerStudent", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Tutor Registration
export const registerTutor = async (
  req: Request<object, object, RegisterBody>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const duplicate = await User.findOne({ where: { email } });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      hashedPassword,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      role: "tutor",
    });

    return res.status(201).json({
      success: true,
      message: "Tutor account created successfully",
    });
  } catch (error) {
    console.error("Error in registerTutor", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Sign In
export const signIn = async (
  req: Request<object, object, SignInBody>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated. Please contact support.",
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.displayName}!`,
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl || null,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in signIn", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Sign Out
export const signOut = async (
  req: RefreshTokenRequest,
  res: Response
): Promise<Response> => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      await Session.destroy({ where: { refreshToken: token } });
    }

    res.clearCookie("refreshToken");

    return res.status(204).send();
  } catch (error) {
    console.error("Error in signOut", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Refresh Token
export const refreshToken = async (
  req: RefreshTokenRequest,
  res: Response
): Promise<Response> => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const session = await Session.findOne({ where: { refreshToken: token } });
    if (!session) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (session.expiresAt < new Date()) {
      await Session.destroy({ where: { id: session.id } });
      return res.status(403).json({
        success: false,
        message: "Refresh token has expired",
      });
    }

    // Get user for full payload
    const user = await User.findByPk(session.userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User not found",
      });
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("Error in refreshToken", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
