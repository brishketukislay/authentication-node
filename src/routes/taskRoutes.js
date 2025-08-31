const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { addTask, editTask, deleteTask, getTasks } = require('../controllers/taskController');
const router = express.Router();

router.post('/tasks', protect, addTask);
router.put('/tasks/:taskId', protect, editTask);
router.delete('/tasks/:taskId', protect, deleteTask);
router.get('/tasks', protect, getTasks);

module.exports = router;
