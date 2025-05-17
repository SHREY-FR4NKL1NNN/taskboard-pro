const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  trigger: {
    type: String,
    enum: ['statusChanged', 'assigned', 'dueDatePassed'],
    required: true,
  },
  condition: { type: Object, required: true }, // e.g., { status: "Done" }
  action: { type: Object, required: true },     // e.g., { assignBadge: true }
}, { timestamps: true });

module.exports = mongoose.model('Automation', automationSchema);
