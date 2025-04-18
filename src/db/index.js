import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

//lets learn simple method to learn db
const connectDB = async() => { // we are using async because the database is always in another continent
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)   // because the database is in another continent

        console.log(`/n MongoDB Connected! DB host: ${connectionInstance.connection.host}`)
        console.log(`/n MongoDB connected! DB port: ${connectionInstance.connection.port}`)
        console.log(`/n MongoDB connected ! DB Name : ${connectionInstance.connection.name}`)
        console.log(`/n MongoDB connected ! DB readyState: ${connectionInstance.connection.readyState}`)
        console.log(`/n MongoDB connected! DB connection String ${connectionInstance.connection.client.s.url}`)
    } catch (error) {
        console.log("MongoDB connection error ",error)
        process.exit(1)
    }
}

export default connectDB