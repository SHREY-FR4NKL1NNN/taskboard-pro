const express = require('express');
const router = express.Router();
const Automation = require('../models/Automation');
const verifyFirebaseToken = require('../middleware/authMiddleware');

// Get all automations for a project
router.get('/:projectId', verifyFirebaseToken, async (req, res) => {
  const automations = await Automation.find({ projectId: req.params.projectId });
  res.json(automations);
});

// Create automation rule
router.post('/', verifyFirebaseToken, async (req, res) => {
  const { projectId, trigger, condition, action } = req.body;
  const automation = new Automation({ projectId, trigger, condition, action });
  const saved = await automation.save();
  res.status(201).json(saved);
});

router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    await Automation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Automation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const updated = await Automation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
