const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const router = express.Router();

// POST /register - Register a new user
router.post('/register', registerUser);

// POST /login - Login a user
router.post('/login', loginUser);

module.exports = router;
