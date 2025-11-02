export const authMe = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User info retrieved successfully",
      user: req.user, // assuming req.user is populated by authentication middleware
    });
  } catch (error) {
    console.error("Error in authMe:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
