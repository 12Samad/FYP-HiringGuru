const express = require("express");
const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing
const router = express.Router();
const User = require("./userModel");
const InterviewSetup = require("./InterviewSetup");

// Route to save interview setup
router.post("/setup", async (req, res) => {
    try {
      const { jobDescription, numberOfQuestions, difficultyLevel } = req.body;
  
      if (!jobDescription || !numberOfQuestions || !difficultyLevel) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const newInterview = new InterviewSetup({
        jobDescription,
        numberOfQuestions,
        difficultyLevel,
      });
  
      await newInterview.save();
      res.status(201).json({ message: "Interview setup saved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
