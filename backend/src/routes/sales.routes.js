import { Router } from "express";
import { checkSalesPersonLogin, getAssignedLeads, getFollowUpLeads, getLeadById, getLeadsSummary, loginSalesPerson, logout, registerSalesPerson, updateLead } from "../controllers/sales.controller.js";
import { salesAuth } from "../middlewares/auth.middleware.js";
import { mediaUpload } from "../middlewares/multer.middleware.js";
const router = Router()

// auth routes
router.post('/register', mediaUpload('/salesDp').single('avatar') , registerSalesPerson)
router.post('/login' , loginSalesPerson)
router.get('/checkLogin', salesAuth , checkSalesPersonLogin)
router.get('/logout' , salesAuth, logout)

// lead management routes
router.get('/leads', salesAuth, getAssignedLeads);
router.get('/leads/followup', salesAuth, getFollowUpLeads);
router.put('/leads/:id', salesAuth, updateLead);
router.get('/getLeadDetails/:id' , salesAuth, getLeadById)
router.get('/summary', salesAuth, getLeadsSummary);



export default router