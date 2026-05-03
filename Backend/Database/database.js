import mongoose from "mongoose";

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.DB_URI)
        console.log(`connected successfully to database`)
    } catch (error) {
        console.log(`couldn't connect to database ${error}`)
    }
}
export default connectToDatabase