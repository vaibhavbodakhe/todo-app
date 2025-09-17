const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  task: { type: String, required: true },
  completed: { type: Boolean, default: false },
  time: { type: Date },
  color: { type: String }
});

module.exports = mongoose.model("Todo", todoSchema);
