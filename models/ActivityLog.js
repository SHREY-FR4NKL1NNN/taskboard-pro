const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  message: { type: String, required: true },
  triggeredBy: { type: String, default: 'system' }, // "system" or Firebase UID
  type: { type: String, enum: ['automation', 'manual'], default: 'manual' },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
