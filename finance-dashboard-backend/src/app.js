const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const auth = require("./middlewares/auth");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Transaction = require("./models/Transaction");
const Budget = require("./models/Budget");
const EMI = require("./models/EMI");

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/register", async (req, res) => {
  console.log("--- DEBUG START ---");
  console.log("1. Request Body:", req.body);

  try {
    const { name, email, password } = req.body;

    // Manual Validation Check
    if (!name || !email || !password) {
      console.log("2. Validation Failed");
      return res.status(400).json({ message: "Missing fields" });
    }

    console.log("3. Checking for existing user...");
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log("4. User exists");
      return res.status(409).json({ message: "User exists" });
    }

    console.log("5. Attempting User.create...");
    // We use 'new User' + 'save' instead of 'create' to get more control
    const user = new User({ name, email, password });
    
    console.log("6. About to call user.save()...");
    const savedUser = await user.save(); 
    
    console.log("7. user.save() successful!");
    res.status(201).json({ message: "Success", userId: savedUser._id });

  } catch (error) {
    console.log("--- ERROR DETECTED ---");
    console.log("Error Name:", error.name);
    console.log("Error Message:", error.message);
    console.log("Error Stack:", error.stack); // This will tell us the exact file and line number
    res.status(500).json({ error: error.message });
  }
});


app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // 1️⃣ Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
  
      // 2️⃣ Find user and explicitly include password
      const user = await User.findOne({ email }).select("+password");
  
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // 3️⃣ Compare passwords
      const isMatch = await user.comparePassword(password);
  
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // 4️⃣ Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
  
      res.json({
        message: "Login successful",
        userId: user._id,
        token: token
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  
app.post("/transactions", auth, async (req, res) => {
    try {
      const transactions = req.body;
  
      if (!Array.isArray(transactions)) {
        return res.status(400).json({ message: "Array of transactions required" });
      }
  
      // Attach userId securely from token
      const enriched = transactions.map(txn => ({
        ...txn,
        userId: req.user.userId
      }));
  
      // 🔥 BULK INSERT
      const result = await Transaction.insertMany(enriched);
  
      res.json({
        message: "Transactions added",
        count: result.length
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

  
app.get("/analytics/monthly", auth, async (req, res) => {
    try {
      const { month, year } = req.query;

      // Validate query parameters
      if (!month || !year) {
        return res.status(400).json({ message: "Month and year query parameters are required" });
      }

      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ message: "Month must be a number between 1 and 12" });
      }

      if (isNaN(yearNum)) {
        return res.status(400).json({ message: "Year must be a valid number" });
      }

      const start = new Date(yearNum, monthNum - 1, 1);
      const end = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

      const data = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user.userId),
            date: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" }
          }
        }
      ]);

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
app.get("/analytics/category", auth, async (req, res) => {
    try {
      const data = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user.userId),
            type: "expense"
          }
        },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]);

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
app.get("/analytics/cashflow", auth, async (req, res) => {
    try {
      const data = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user.userId)
          }
        },
        {
          $group: {
            _id: null,
            income: {
              $sum: {
                $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
              }
            },
            expense: {
              $sum: {
                $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
              }
            }
          }
        }
      ]);

      const result = data[0] || { income: 0, expense: 0 };
      const { _id, ...cashflow } = result;
      
      res.json({
        income: cashflow.income || 0,
        expense: cashflow.expense || 0,
        net: (cashflow.income || 0) - (cashflow.expense || 0)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
app.post("/budgets", auth, async (req, res) => {
    try {
      const { category, limit, period } = req.body;
  
      if (!category || !limit || !period) {
        return res.status(400).json({ message: "All fields required" });
      }
  
      const budget = await Budget.create({
        userId: req.user.userId,
        category,
        limit,
        period
      });
  
      res.json({
        message: "Budget created",
        budget
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

app.get("/budgets/alerts", auth, async (req, res) => {
    try {
      const budgets = await Budget.find({ userId: req.user.userId });
  
      const alerts = [];
  
      for (let budget of budgets) {
        const now = new Date();
        let startDate;
  
        if (budget.period === "monthly") {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
        }
  
        const spending = await Transaction.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(req.user.userId),
              category: budget.category,
              type: "expense",
              date: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" }
            }
          }
        ]);
  
        const totalSpent = spending[0]?.total || 0;
  
        if (totalSpent > budget.limit) {
          alerts.push({
            category: budget.category,
            limit: budget.limit,
            spent: totalSpent,
            exceededBy: totalSpent - budget.limit
          });
        }
      }
  
      res.json(alerts);
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


app.post("/emis", auth, async (req, res) => {
  try {
    const { title, amount, dueDate } = req.body;

    if (!title || !amount || !dueDate) {
      return res.status(400).json({ message: "All fields required" });
    }

    const emi = await EMI.create({
      userId: req.user.userId,
      title,
      amount,
      dueDate
    });

    res.json({
      message: "EMI added",
      emi
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/emis/upcoming", auth, async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const emis = await EMI.find({
      userId: req.user.userId,
      status: "pending",
      dueDate: { $gte: today, $lte: nextWeek }
    }).sort({ dueDate: 1 });

    res.json(emis);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/emis/:id/pay", auth, async (req, res) => {
  try {
    const emi = await EMI.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { status: "paid" },
      { new: true }
    );

    if (!emi) {
      return res.status(404).json({ message: "EMI not found" });
    }

    res.json({
      message: "EMI marked as paid",
      emi
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = app;
