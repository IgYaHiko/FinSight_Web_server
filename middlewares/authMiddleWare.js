import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req,res,next) => {
     let token = req.headers.authorization?.split(" ")[1];
     if(!token) {
        return res.status(401).json({message: "Not authorizeddd"})
     }
     try{
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        req.user = await User.findById(decode.id).select("-password")
        next()
     } catch(error) {
         res.status(500).json({message: "not auth failed"})
     }


}