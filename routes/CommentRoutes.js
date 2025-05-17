const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const verifyFirebaseToken = require('../middleware/authMiddleware');

// Get comments for a task
router.get('/:taskId', verifyFirebaseToken, async (req, res) => {
  const comments = await Comment.find({ taskId: req.params.taskId }).sort({ createdAt: 1 });
  res.json(comments);
});

// Add a comment to a task
router.post('/:taskId', verifyFirebaseToken, async (req, res) => {
  const { text } = req.body;
  const comment = await Comment.create({
    taskId: req.params.taskId,
    userId: req.user.uid,
    userName: req.user.name || req.user.email,
    text
  });
  res.status(201).json(comment);
});

module.exports = router;