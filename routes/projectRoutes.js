const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const verifyFirebaseToken = require('../middleware/authMiddleware');

// Create a project
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { title, description, statuses } = req.body;
    const newProject = new Project({
      title,
      description,
      statuses: statuses?.length ? statuses : undefined,
      createdBy: req.user.uid,
    });

    const saved = await newProject.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get projects owned by or shared with the user
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const projects = await Project.find({ members: uid });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
