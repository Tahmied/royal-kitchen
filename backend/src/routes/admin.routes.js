import { Router } from "express";
import { assignLead, checkAdminLogin, deleteLead, editLead, exportLeads, getLeads, loginAdmin, logout, registerAdmin } from "../controllers/admin.controller.js";
import { getFollowUpLeads } from "../controllers/sales.controller.js";
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
router.put('/editLead/:id' , adminAuth , editLead )
router.delete('/deleteLead/:id', adminAuth, deleteLead); 
router.post('/assignLeads', adminAuth, assignLead);
router.get('/followup', adminAuth, getFollowUpLeads); 
router.get('/exportLeads', adminAuth, exportLeads); 

export default router