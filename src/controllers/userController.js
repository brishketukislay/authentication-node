const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Utility function to generate tokens
const generateTokens = (userId) => {
  // Access token with 15 minutes expiration
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  // Refresh token with 7 days expiration
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

// Register new user
const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
    });

    // Save user to the DB
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true, //process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: "none",//'Strict', // Mitigate CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // Refresh token expires in 7 days
    });

    // Set access token in HTTP-only cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'Strict', // Mitigate CSRF attacks
      maxAge: 15 * 60 * 1000, // Access token expires in 15 minutes
    });

    // Send response without the access token in body (it's in the cookie)
    res.status(201).json({
      message: 'User registered successfully',
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if the password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'Strict', // Mitigate CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // Refresh token expires in 7 days
    });

    // Set access token in HTTP-only cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'Strict', // Mitigate CSRF attacks
      maxAge: 15 * 60 * 1000, // Access token expires in 15 minutes
    });

    // Send success response without the access token in body (it's in the cookie)
    res.status(200).json({
      message: 'User logged in successfully',
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refresh access token
const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(403).json({ message: 'No refresh token provided' });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Find the user associated with the token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new access token
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Set the new access token in the HTTP-only cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'Strict', // Mitigate CSRF attacks
      maxAge: 15 * 60 * 1000, // Access token expires in 15 minutes
    });

    // Send success response
    res.json({ message: 'Access token refreshed' });

  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// Logout user (clear cookies)
const logoutUser = (req, res) => {
  res.clearCookie('access_token', { path: '/' });  // Clear access_token
  res.clearCookie('refresh_token', { path: '/' });  // Clear refresh_token
  res.clearCookie('connect.sid', { path: '/' });  // Clear session cookie if using express-session
  res.status(200).json({ message: 'User logged out successfully' });
};

// Export controller functions
module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser };
