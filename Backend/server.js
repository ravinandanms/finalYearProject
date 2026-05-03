import express from "express"
import dotenv from "dotenv"
import connectToDatabase from "./Database/database.js"
dotenv.config()
const PORT = process.env.PORT
const app = express()

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)
})

// Connecting to database 
connectToDatabase()