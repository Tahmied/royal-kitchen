import { Router } from "express";
import { loginAdmin, registerAdmin } from "../controllers/admin.controller.js";
import { mediaUpload } from "../middlewares/multer.middleware.js";

const router = Router()

router.post('/register', mediaUpload('/dp').single('avatar') , registerAdmin)
router.post('/login' , loginAdmin)

export default router