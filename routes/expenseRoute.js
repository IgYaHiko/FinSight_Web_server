import express from "express"
import { protect } from "../middlewares/authMiddleWare.js";
import {
  addExpense,
  delectExpense,
  downloadExpenseXL,
  getAllExpense
} from '../controllers/expenseController.js'
const route = express.Router();

route.post("/addExpense",protect,addExpense);
route.delete("/:id",protect,delectExpense);
route.get("/getAllExpense",protect,getAllExpense);
route.get("/downloadExpenseXL",protect,downloadExpenseXL)


export default route

