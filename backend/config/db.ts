import mongoose from "mongoose";

const connectDB = async () => {
    console.log('MONGO_URL:', process.env.MONGO_URL); // 👈 this must not be undefined

    if (!process.env.MONGO_URL) {
        console.error('❌ MONGO_URL is undefined. Check your .env file.');
        process.exit(1);
    }
    try {
        await mongoose.connect(process.env.MONGO_URL as string);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Failed", error);
        process.exit(1);
    }
}

export default connectDB;