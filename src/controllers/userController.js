const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const registerUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ email, password });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge:15 * 60 * 1000, // 15 minute
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 15* 60 * 1000,
    });
    res.cookie('user_id', user._id.toString(), {
  httpOnly: true,
  secure: false, // Set to true in production with HTTPS
  sameSite: 'Lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});


    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const refreshAccessToken = async (req, res) => {
  const accessTokenCookie = req.cookies.access_token;
  // const userId = accessTokenCookie ? jwt.decode(accessTokenCookie)?.id : null;
  const userId = req.cookies.user_id;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const user = await User.findById(userId);
  if (!user || !user.refreshToken) return res.status(403).json({ message: 'Invalid refresh token' });

  const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  res.cookie('access_token', newAccessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: 15 * 60 * 1000,
  });
  res.json({ message: 'Token refreshed' });
};

const logoutUser = async (req, res) => {
  const accessCookie = req.cookies.access_token;
  if (accessCookie) {
    const decoded = jwt.decode(accessCookie);
    if (decoded?.id) {
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
  }

  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('user_id', { path: '/' });
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser };
