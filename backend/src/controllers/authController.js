import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Student Registration - Separate endpoint for student registration
export const registerStudent = async (req, res) => {
  try {
    // Only basic fields needed for student registration
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if email already exists
    const duplicate = await User.findOne({ email });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student user with auto-set role
    await User.create({
      email,
      hashedPassword,
      displayName: `${firstName} ${lastName}`,
      role: "student", // Auto-set role for student registration
    });

    return res.status(201).json({
      success: true,
      message: "Student account created successfully",
    });
  } catch (error) {
    console.error("Error in registerStudent:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Tutor Registration - Separate endpoint for tutor registration
export const registerTutor = async (req, res) => {
  try {
    // Only basic fields needed for tutor registration (same as student)
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if email already exists
    const duplicate = await User.findOne({ email });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create tutor user with auto-set role
    await User.create({
      email,
      hashedPassword,
      displayName: `${firstName} ${lastName}`,
      role: "tutor", // Auto-set role for tutor registration
    });

    return res.status(201).json({
      success: true,
      message: "Tutor account created successfully",
    });
  } catch (error) {
    console.error("Error in registerTutor:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const signUp = async (req, res) => {
  try {
    // Lấy basic fields từ frontend: email, password, firstName, lastName, role
    const { email, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate role (chỉ cho phép student hoặc tutor)
    if (!["student", "tutor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'student' or 'tutor'",
      });
    }

    // Check if email already exists
    const duplicate = await User.findOne({ email });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user với basic fields + role
    await User.create({
      email,
      hashedPassword,
      displayName: `${firstName} ${lastName}`,
      role, // Set role cho user (student hoặc tutor)
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } account created successfully`,
    });
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
    // Get email and password from request (no username needed)
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email instead of username
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create Access Token with user info including role
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
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
      maxAge: REFRESH_TOKEN_TTL,
    });

    // Return user info with role for frontend to handle redirect
    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.displayName}!`,
      token: accessToken,
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

export const refreshToken = async (req, res) => {
  try {
    // Take refresh token from cookies
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Check if refresh token is expired
    if (session.expiresAt < Date.now()) {
      return res.status(403).json({
        success: false,
        message: "Refresh token has expired",
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: session.userId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_TTL,
      }
    );

    // Return new access token
    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("Error in refreshToken:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
