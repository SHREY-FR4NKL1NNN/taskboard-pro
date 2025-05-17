const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/authMiddleware');
const ActivityLog = require('../models/ActivityLog');

// Get activity logs for a project
router.get('/:projectId', verifyFirebaseToken, async (req, res) => {
  const logs = await ActivityLog.find({ projectId: req.params.projectId })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(logs);
});

module.exports = router;
