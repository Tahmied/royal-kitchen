import { Router } from "express";
import { checkSalesPersonLogin, loginSalesPerson, logout, registerSalesPerson } from "../controllers/sales.controller.js";
import { salesAuth } from "../middlewares/auth.middleware.js";
import { mediaUpload } from "../middlewares/multer.middleware.js";
const router = Router()

// auth routes
router.post('/register', mediaUpload('/salesDp').single('avatar') , registerSalesPerson)
router.post('/login' , loginSalesPerson)
router.get('/checkLogin', salesAuth , checkSalesPersonLogin)
router.get('/logout' , salesAuth, logout)


export default router