import { Router } from "express";
import { checkAdminLogin, editLead, getLeads, loginAdmin, logout, registerAdmin } from "../controllers/admin.controller.js";
import { adminAuth } from "../middlewares/auth.middleware.js";
import { mediaUpload } from "../middlewares/multer.middleware.js";

const router = Router()

// auth routes
router.post('/register', mediaUpload('/dp').single('avatar') , registerAdmin)
router.post('/login' , loginAdmin)
router.get('/checkLogin', adminAuth , checkAdminLogin)
router.get('/logout' , adminAuth, logout)


// leads routes
router.get('/getLeads' ,adminAuth , getLeads )
router.post('/editLead' , adminAuth , editLead )


export default router