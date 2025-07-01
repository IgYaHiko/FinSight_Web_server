import Expense from "../models/Expense.js";
import Income from "../models/Income.js";

import { isValidObjectId, Types } from "mongoose";

export const getDashBoardData = async (req, res) => {
  try {
    const userID = req.user.id;

    // ✅ Validate ObjectId
    if (!isValidObjectId(userID)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userObjectId = new Types.ObjectId(String(userID));

    // ✅ Total Income
    const totalIncomeResult = await Income.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalIncome = totalIncomeResult[0]?.total || 0;

    // ✅ Total Expenses
    const totalExpensesResult = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalExpenses = totalExpensesResult[0]?.total || 0;

   /*  // ✅ Check: Expenses > Income
    if (totalExpenses > totalIncome) {
      return res.status(400).json({
        message: "You don’t have enough balance to spend. Your expenses exceed your income.",
        totalIncome,
        totalExpenses,
        totalBalance: totalIncome - totalExpenses
      });
    }
 */
    // ✅ Last 60 Days Income
    const last60DaysIncomeTransaction = await Income.find({
      userId: userObjectId,
      date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
    }).sort({ date: -1 });

    const incomeLast60Days = last60DaysIncomeTransaction.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );

    // ✅ Last 30 Days Expenses
    const last30DaysExpenseTransaction = await Expense.find({
      userId: userObjectId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ date: -1 });

    const expenseLast30days = last30DaysExpenseTransaction.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );

    // ✅ Last 5 Combined Transactions
    const lastTransaction = [
      ...(await Income.find({ userId: userObjectId }).sort({ date: -1 }).limit(5)).map(
        (txn) => ({
          ...txn.toObject(),
          type: "income"
        })
      ),
      ...(await Expense.find({ userId: userObjectId }).sort({ date: -1 }).limit(5)).map(
        (txn) => ({
          ...txn.toObject(),
          type: "expense"
        })
      )
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // ✅ Final Response
    return res.json({
      totalBalance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      last30DaysExpenses: {
        total: expenseLast30days,
        transaction: last30DaysExpenseTransaction
      },
      last60DaysIncomes: {
        total: incomeLast60Days,
        transaction: last60DaysIncomeTransaction
      },
      recentTransaction: lastTransaction
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ message: "Server Error: Failed to fetch dashboard data" });
  }
};
