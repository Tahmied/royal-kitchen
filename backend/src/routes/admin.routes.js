import { Router } from "express";
import { registerAdmin } from "../controllers/admin.controller.js";
import { mediaUpload } from "../middlewares/multer.middleware.js";

const router = Router()

router.post('/register', mediaUpload('uploads/dp').single('avatar') , registerAdmin)

export default router