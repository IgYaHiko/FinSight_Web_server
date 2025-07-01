import express from 'express'
import { protect } from '../middlewares/authMiddleWare.js'
import { getDashBoardData } from '../controllers/dashBoardController.js';

const route = express.Router();

route.get("/data",protect,getDashBoardData);

export default route;