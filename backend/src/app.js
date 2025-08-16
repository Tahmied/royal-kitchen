import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

const app = express()

app.use(cors({origin:process.env.ORIGIN}))
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true , limit : '16kb'}))
app.use(cookieParser())
app.use(express.static('public'))

import adminRoutes from './routes/admin.routes.js'

app.use('/api/v1/admin' , adminRoutes)

export { app }
