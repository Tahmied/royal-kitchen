import dotenv from 'dotenv';
import { app } from "./app.js";
import { connectDb } from "./db/connectDb.js";

dotenv.config({
    path:'./.env'
})

connectDb()
.then(()=> {
    app.listen(process.env.PORT || 200 , ()=>{
        console.log(`server is running at port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log(`Couldnt connected to the server in server.js due to ${err}`)
})