import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { errorHandler } from './middlewares/errorHandle.middleware.js'

const app = express()

app.use(cors({origin:process.env.ORIGIN}))
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true , limit : '16kb'}))
app.use(cookieParser())
app.use(express.static('public'))

import adminRoutes from './routes/admin.routes.js'
import leadRoutes from './routes/lead.routes.js'

app.use('/api/v1/admin' , adminRoutes)
app.use('/api/v1/leads' , leadRoutes)

app.use(errorHandler);
export { app }
