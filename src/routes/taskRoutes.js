const express = require('express');
const { protect } = require('../middleware/authMiddleware'); // Protect route middleware
const { addTask, editTask, deleteTask, getTasks } = require('../controllers/taskController');
const router = express.Router();

// Protected routes
router.post('/tasks', protect, addTask); // Add a task
router.put('/tasks/:taskId', protect, editTask); // Edit a task
router.delete('/tasks/:taskId', protect, deleteTask); // Delete a task
router.get('/tasks', protect, getTasks); // Get all tasks

module.exports = router;
