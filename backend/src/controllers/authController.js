import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // TODO: Validate username input
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    // TODO: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: Create new user in database
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    // TODO: Return success response
    return res.sendStatus(201);
  } catch (error) {
    console.error("Error in signUp:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const signIn = async (req, res) => {
  try {
    // TODO: Implement sign-in logic
    // Get input from req.body
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Get hashed password, create Access Token with JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_TTL,
      }
    );

    // Create Refresh Token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // Create new session to store Refresh Token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // Return Refresh Token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: "true",
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL, // 7 days
    });

    // Return Access Token in response body
    return res.status(200).json({
      success: true,
      message: `User ${user.displayName} signed in successfully`,
      accessToken,
    });
  } catch (error) {
    console.error("Error in signIn:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const signOut = async (req, res) => {
  try {
    // Take refresh token from cookies
    const token = req.cookies.refreshToken;

    if (token) {
      // Delete refresh token in Session
      await Session.deleteOne({ refreshToken: token });
    }

    // Always clear cookie (even if no token)
    res.clearCookie("refreshToken");

    return res.status(204).json({
      success: true,
      message: "User signed out successfully",
    });
  } catch (error) {
    console.error("Error in signOut:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
