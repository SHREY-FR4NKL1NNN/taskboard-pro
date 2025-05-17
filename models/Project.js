const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdBy: { type: String, required: true },
  statuses: {
    type: [String],
    default: ["To Do", "In Progress", "Done"],
  },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
