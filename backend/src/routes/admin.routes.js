import { Router } from "express";
import { assignLead, bulkDeleteLeads, bulkUpdateLeads, checkAdminLogin, deleteLead, deleteSalesperson, editLead, exportLeads, getLeadById, getLeads, getSalespersons, loginAdmin, logout, registerAdmin, updateSalesperson } from "../controllers/admin.controller.js";
import { getFollowUpLeads } from "../controllers/sales.controller.js";
import { adminAuth } from "../middlewares/auth.middleware.js";
import { mediaUpload } from "../middlewares/multer.middleware.js";

const router = Router()

// auth routes
router.post('/register', mediaUpload('/dp').single('avatar') , registerAdmin)
router.post('/login' , loginAdmin)
router.get('/checkLogin', adminAuth , checkAdminLogin)
router.get('/logout' , adminAuth, logout)

// leads management routes
router.get('/getLeads' ,adminAuth , getLeads )
router.put('/editLead/:id' , adminAuth , editLead )
router.delete('/deleteLead/:id', adminAuth, deleteLead); 
router.post('/assignLeads', adminAuth, assignLead);
router.get('/followup', adminAuth, getFollowUpLeads); 
router.get('/exportLeads', adminAuth, exportLeads); 
router.get('/getLead/:id', adminAuth, getLeadById);
router.put('/bulk-update', adminAuth, bulkUpdateLeads);
router.delete('/bulk-delete', adminAuth, bulkDeleteLeads);
router.get('/getSalespersons', adminAuth, getSalespersons);

// Salesperson management routes
router.get('/salespersons', adminAuth, getSalespersons);
router.put('/salesperson/:id', adminAuth, mediaUpload('/salesDp').single('avatar'), updateSalesperson );
router.delete('/salesperson/:id', adminAuth, deleteSalesperson);



export default router