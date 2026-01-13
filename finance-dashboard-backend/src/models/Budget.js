const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    category: {
      type: String,
      required: true
    },

    limit: {
      type: Number,
      required: true
    },

    period: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

budgetSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("Budget", budgetSchema);
