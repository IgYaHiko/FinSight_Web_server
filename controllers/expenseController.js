import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import User from "../models/User.js";
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const addExpense = async (req,res) => {
     const userId = req.user.id;
     try {
       const { icon, category, amount, date } = req.body;
       if(!category || !amount || !date) {
          return res.status(400).json({message: "are you dumb fucker all fields is requird"});
       }
       const expense = new Expense({
            userId,
            icon,
            category,
            amount,
            date
       });
       await expense.save();
       res.status(200).json({message: "new Expense is added"});
         
     }catch(error) {
         console.log("Server Error",error);
         return res.status(500).json({message: "server failed expense is not added"})
     }
}

export const getAllExpense = async (req,res) => {
     const userId = req.user.id;

     try {
       const allExpensse = await Expense.find({userId}).sort({date: -1})
       res.json(allExpensse) 
        
     } catch (error) {
       console.log("Server Error failed to Show all expense",error)
     }
}

export const delectExpense = async (req,res) => {
     try {
       const deleteEx = await Expense.findByIdAndDelete(req.params.id).sort({date: -1});
       if(!deleteEx) return res.status(401).json({message: "expense is not exxist"});
       res.json({message: "Expense is deleted successfully"});
     } catch (error) {
        return res.status(500).json({message: "expense is not deleted, server failed"});
     }
}

export const downloadExpenseXL = async (req, res) => {
  const userId = req.user.id;

  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expense Report');

    worksheet.columns = [
      { header: 'Category', key: 'category', width: 25 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Date', key: 'date', width: 20 },
    ];

    expense.forEach((item) => {
      worksheet.addRow({
        category: item.category, 
        amount: item.amount,
        date: item.date.toISOString().split('T')[0],
      });
    });

    const downloadsDir = path.join(__dirname, '../ExpenseDownload');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const filePath = path.join(downloadsDir, `expense-report-${userId}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath); 
  } catch (error) {
    console.error('Error saving Excel file:', error);
    res.status(500).json({ message: 'Server error: download failed' });
  }
};
