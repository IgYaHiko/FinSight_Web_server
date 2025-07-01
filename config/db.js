import mongoose from "mongoose";

export const connectDb = async () => {
      try {
        await mongoose.connect(process.env.MONGODB_URL,{})
        console.log("✅ Database is connected successfullly")
      } catch (error) {
        console.log("DB is not connected",error)
        process.exit(1)
        
      }
}

