import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import incomeRoute from "./routes/incomeRoutes.js";
import expenseRoute from "./routes/expenseRoute.js";
import dashBoardRoute from "./routes/dashboardRoute.js";
import { connectDb } from "./config/db.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  Connect Database
connectDb();

// Enable CORS before routes
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// ✅ Middleware
app.use(express.json());
app.use(express.text());
app.use(cookieParser());
app.use(morgan("dev"));

// Optional: Handle plain text bodies pretending to be JSON
app.use((req, res, next) => {
  if (req.is('text/plain')) {
    try {
      req.body = JSON.parse(req.body);
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON in plain text body" });
    }
  }
  next();
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoute);
app.use("/api/v1/expense", expenseRoute);
app.use("/api/v1/dashboard", dashBoardRoute);

//  Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//  Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
