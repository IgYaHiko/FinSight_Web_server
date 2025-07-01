import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { use } from "react";
import { token } from "morgan";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "2h" });
};

export const registerUser = async (req, res) => {
  // Debugging logs`
  console.log("Headers:", req.headers);
  console.log("Raw body:", req.body);

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "Request body is empty",
      receivedHeaders: req.headers,
      expected: "Content-Type: application/json with valid JSON body"
    });
  }

  const { name, email, password, profilePic } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ 
      message: "All fields are required",
      received: { name, email, password } 
    });
  }

  try {
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({ name, email, password, profilePic });
    
    res.status(201).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      message: "Registration failed",
      error: error.message 
    });
  }
};
export const loginUser = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "Request body is empty",
      receivedHeaders: req.headers,
      expected: "Content-Type: application/json with valid JSON body"
    });
  }

  const { email, password, userData } = req.body;

  try {
    // ✅ Google login flow
    if (userData) {
      const { email, name, profilePic } = userData;

      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name,
          email,
          profilePic,
          authType: 'google'
        });
      }

      return res.status(200).json({
        id: user._id,
        user,
        token: generateToken(user._id)
      });
    }

    // ✅ Regular email/password login
    if (!email || !password) {
      return res.status(400).json({ message: "Fill all the fields" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Password not matched" });
    }

    return res.status(200).json({
      id: user._id,
      user,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.log("Login Error", error);
    return res.status(500).json({
      message: "Login Failed",
      error: error.message
    });
  }
};

export const getUser = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if(!user) {
         res.status(404).json({message: "No created yet"})
      }
      res.status(200).json(user)
    } catch (error) {
      console.log("User error", error)
      res.status(500).json({message: "No user", error: error.message})
      
    }
};

// controllers/authController.js
export const updateProfileImage = async (req, res) => {
  const { imageUrl } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic: imageUrl },
      { new: true }
    );
    res.status(200).json({ message: "Image updated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update image" });
  }
};


// controllers/authController.js
export const updateProfileDetails = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated", user: updatedUser });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }

    console.error("Update profile error", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
