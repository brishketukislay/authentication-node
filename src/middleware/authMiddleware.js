const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // Try to get token from Authorization header first
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Extract token from 'Bearer <token>'
  }

  // If not found in Authorization header, check cookies for the access_token
  if (!token && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  // If token is found, verify it
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.id; // Attach the user ID to the request object
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'No token, authorization denied' });
  }
};

module.exports = { protect };
