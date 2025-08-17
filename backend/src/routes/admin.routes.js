import { Router } from "express";
import { checkAdminLogin, loginAdmin, logout, registerAdmin } from "../controllers/admin.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { mediaUpload } from "../middlewares/multer.middleware.js";

const router = Router()

router.post('/register', mediaUpload('/dp').single('avatar') , registerAdmin)
router.post('/login' , loginAdmin)
router.get('/checkLogin', auth , checkAdminLogin)
router.get('/logout' , auth, logout)

export default router