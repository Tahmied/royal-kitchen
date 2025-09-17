import { Router } from "express";
import { createFeedback } from "../controllers/feedback.controller.js";
import { mediaUpload } from "../middlewares/multer.middleware.js";

const router = Router()

router.post('/create-feedback', mediaUpload('feedback').fields([
        { name: 'feedbackClientImage', maxCount: 1 },
        { name: 'feedbackLogoImage', maxCount: 1 },
        { name: 'feedbackRightImage', maxCount: 1 },
    ]), createFeedback )

export default router