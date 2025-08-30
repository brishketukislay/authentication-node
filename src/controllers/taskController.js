const Task = require('../models/Task');

// Add a new task
const addTask = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user; // User ID comes from the protected route

  try {
    if (!userId) {
      return res.status(400).json({ message: 'User ID not provided' });
    }
    const newTask = new Task({
      title,
      description,
      user: userId, // Link the task to the logged-in user
    });

    await newTask.save();
    res.status(201).json({ message: 'Task added successfully', task: newTask });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Failed to add task', error: error.message });;
  }
};

// Edit an existing task
const editTask = async (req, res) => {
  const { taskId } = req.params; // Get the task ID from URL params
  const { title, description, completed } = req.body;
  const userId = req.user; // User ID from the protected route

  try {
    const task = await Task.findOne({ _id: taskId, user: userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    // Update the task fields
    task.title = title || task.title;
    task.description = description || task.description;
    task.completed = completed !== undefined ? completed : task.completed;

    await task.save();

    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user; // User ID from the protected route

  try {
    const task = await Task.findOneAndDelete({ _id: taskId, user: userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tasks for the user
const getTasks = async (req, res) => {
  const userId = req.user;

  try {
    const tasks = await Task.find({ user: userId });
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addTask, editTask, deleteTask, getTasks };
