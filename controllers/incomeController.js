import jwt from "jsonwebtoken"
import User from "../models/User.js"
import Income from "../models/Income.js"
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const addIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, catagory, amount, date } = req.body;

    if (!catagory || !amount || !date) {
      return res.status(400).json({ message: "All fields requiredd" });
    }

    const newIncome = new Income({
      userId,
      icon,
      catagory,
      amount,
      date: new Date(date),
    });

    await newIncome.save();
    res.status(200).json(newIncome);
  } catch (error) {
    console.error("Error adding income:", error); // 🪵 log the actual error
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllIncome = async (req,res) => {
    const userId = req.user.id;

    try {
        const income = await Income.find({userId}).sort({date: -1});
        res.json(income);
    }catch(error) {
        console.log("Error",error);
        return res.status(500).json({message: "Server Errorssss mother fucker..."});
    }
     
}
 
export const deleteIncome = async (req, res) => {
  try {
    
    const deleted = await Income.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Income not found" });
    }

    return res.json({ message: "Successfully deleted the income" });
  } catch (error) {
    console.log("Error in delete route:", error);
    return res.status(500).json({ message: "Server error while deleting income" });
  }
};



export const downloadIncomeXL = async (req, res) => {
  const userId = req.user.id;

  try {
    const income = await Income.find({ userId }).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Income Report');

    worksheet.columns = [
      { header: 'Category', key: 'catagory', width: 25 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Date', key: 'date', width: 20 }
    ];

    income.forEach((item) => {
      worksheet.addRow({
        catagory: item.catagory,
        amount: item.amount,
        date: item.date.toISOString().split('T')[0]
      });
    });

    const downloadsDir = path.join(__dirname, '../IncomeDownload');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const filePath = path.join(downloadsDir, `income-report-${userId}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    // ✅ This is the correct way to send it to frontend
    res.download(filePath);

  } catch (error) {
    console.error('Error saving Excel file:', error);
    res.status(500).json({ message: 'Server error: download failed' });
  }
};
