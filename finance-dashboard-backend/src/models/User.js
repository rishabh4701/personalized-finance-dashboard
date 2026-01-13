const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false // Password won't be returned in queries by default
    }
  },
  {
    timestamps: true
  }
);

/**
 * 🔐 Compare entered password with hashed password
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  // Since password is select: false, ensure it exists before comparing
  if (!this.password) {
    throw new Error("Password field not selected");
  }
  return await bcrypt.compare(enteredPassword, this.password);
};


/**
 * 🛡️ Hash password before saving
 * Note: We removed the 'next' argument. 
 * Mongoose automatically handles completion for async functions.
 */
userSchema.pre("save", async function () {
  // 'this' refers to the user document
  if (!this.isModified("password")) {
    return; // Just return; no next() needed
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // No next() call here! Simply finishing the function tells Mongoose to proceed.
  } catch (err) {
    // If you want to throw an error, just throw it. 
    // Mongoose will catch it and stop the save.
    throw err; 
  }
});

module.exports = mongoose.model("User", userSchema);