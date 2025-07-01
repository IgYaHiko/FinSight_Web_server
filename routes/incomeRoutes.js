import express from "express"
import {addIncome,downloadIncomeXL,getAllIncome,deleteIncome} from "../controllers/incomeController.js"
import { protect } from "../middlewares/authMiddleWare.js";
const route = express.Router();

route.post("/addincome",protect,addIncome);
route.delete("/:id",protect,deleteIncome);
route.get("/downloadXL",protect,downloadIncomeXL);
route.get("/getAll",protect,getAllIncome);

export default route

