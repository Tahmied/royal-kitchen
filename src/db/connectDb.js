import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"



export const connectDb = async () => {
    try {
        const connectRes = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`Mongodb connected at ${connectRes.connection.host}`)
    } catch (err) {
        console.log(`unable to connect to the db in connectdb.js due to ${connectDb}`)
    }
}

