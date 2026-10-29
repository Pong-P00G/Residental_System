import mongoose from "mongoose";


const Dbconnect = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("MongoDB URI not found");
        await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }

    mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
    });
}


export default Dbconnect;