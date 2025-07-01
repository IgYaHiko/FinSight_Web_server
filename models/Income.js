import mongoose from "mongoose";


const IncomeSchema = new mongoose.Schema({
     userId: {type: mongoose.Schema.ObjectId, ref: "User", required: true},
     icon: {type: String},
     catagory: {type: String, required: true},
     amount: {type: Number, required: true},
     date: {type: Date, default: Date.now()}
     },
     {timestamps: true}
)

const Income = mongoose.model("Income",IncomeSchema);
export default Income;