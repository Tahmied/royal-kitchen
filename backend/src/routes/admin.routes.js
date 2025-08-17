import { Router } from "express";
import { checkAdminLogin, loginAdmin, registerAdmin } from "../controllers/admin.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { mediaUpload } from "../middlewares/multer.middleware.js";

const router = Router()

router.post('/register', mediaUpload('/dp').single('avatar') , registerAdmin)
router.post('/login' , loginAdmin)
router.get('/checkLogin', auth , checkAdminLogin)

export default router