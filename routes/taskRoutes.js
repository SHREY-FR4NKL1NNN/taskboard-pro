const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/authMiddleware');
const Task = require('../models/Task');
const Automation = require('../models/Automation');
const ActivityLog = require('../models/ActivityLog');

// Get tasks for a project
router.get('/:projectId', verifyFirebaseToken, async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a task
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { projectId, title, description, status, priority, dueDate, assignedTo } = req.body;

    const newTask = new Task({
      projectId,
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo,
      createdBy: req.user.uid,
    });
    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task status
router.put('/:taskId/status', verifyFirebaseToken, async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status },
      { new: true }
    );

    // --- Automation logic after status update ---
    const automations = await Automation.find({ projectId: updated.projectId });
    for (const rule of automations) {
      if (rule.trigger === 'statusChanged' && rule.condition.status === updated.status) {
        if (rule.action.assignBadge) {
          console.log(`Badge assigned to ${updated.assignedTo}`);
          // Optionally update User model or log activity
        }
        if (rule.action.setStatus) {
          updated.status = rule.action.setStatus;
          await updated.save();
        }
      }
      if (rule.trigger === 'assigned' && rule.condition.assignedTo === updated.assignedTo) {
        if (rule.action.setStatus) {
          updated.status = rule.action.setStatus;
          await updated.save();
        }
      }
    }
    await ActivityLog.create({
      projectId: updated.projectId,
      taskId: updated._id,
      message: `Status changed to "${updated.status}" by automation`,
      type: 'automation',
    });
    // --- End automation logic ---

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Full update of a task
router.put('/:taskId', verifyFirebaseToken, async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    const updated = await Task.findByIdAndUpdate(
      req.params.taskId,
      {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a task
router.delete('/:taskId', verifyFirebaseToken, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;