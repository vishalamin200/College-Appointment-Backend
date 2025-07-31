import mongoose from 'mongoose';

export const connectDB = async () => {

    try {
        const uri = process.env.MONGO_URI;

        await mongoose.connect(uri);
        console.log('Database connected successffully');
        
    } catch (error) {
        console.log("Error while connecting to mongodb" , error.message)
        process.exit(1)
    }
};