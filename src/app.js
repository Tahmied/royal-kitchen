import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middlewares/errorHandle.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

app.use(cors({origin:process.env.ORIGIN}))
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true , limit : '16kb'}))
app.use(cookieParser())
app.use(express.static('public'))

import adminRoutes from './routes/admin.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import leadRoutes from './routes/lead.routes.js';
import projectRoutes from './routes/project.routes.js';
import salesAuth from './routes/sales.routes.js';

app.use('/api/v1/admin' , adminRoutes)
app.use('/api/v1/leads' , leadRoutes)
app.use('/api/v1/sales' , salesAuth)
app.use('/api/v1/projects' , projectRoutes)
app.use('/api/v1/feedbacks', feedbackRoutes)

app.get('/projects/:id', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'blog-post.html'));
});


app.use(errorHandler);
export { app };

