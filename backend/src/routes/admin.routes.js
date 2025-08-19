import { Router } from "express";
import { assignLead, bulkDeleteLeads, bulkUpdateLeads, checkAdminLogin, deleteLead, editLead, exportLeads, getLeadById, getLeads, loginAdmin, logout, registerAdmin } from "../controllers/admin.controller.js";
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
router.get('/getLead/:id', adminAuth, getLeadById);
router.put('/bulk-update', adminAuth, bulkUpdateLeads);
router.delete('/bulk-delete', adminAuth, bulkDeleteLeads);


export default router