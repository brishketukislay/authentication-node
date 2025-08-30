const express = require('express');
const { registerUser, loginUser, refreshAccessToken, logoutUser } = require('../controllers/userController');
const router = express.Router();

// POST /register - Register a new user
router.post('/register', registerUser);

// POST /login - Login a user
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logoutUser);

module.exports = router;
