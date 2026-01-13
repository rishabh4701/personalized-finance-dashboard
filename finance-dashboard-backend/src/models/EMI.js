const mongoose = require("mongoose");

const emiSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    dueDate: {
      type: Date,
      required: true,
      index: true
    },

    frequency: {
      type: String,
      enum: ["monthly"],
      default: "monthly"
    },

    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

emiSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model("EMI", emiSchema);
