import { Router } from "express";
import { createFeedback, deleteFeedback, getFeedbacks, updateFeedback } from "../controllers/feedback.controller.js";
import { adminAuth } from "../middlewares/auth.middleware.js";
import { mediaUpload } from "../middlewares/multer.middleware.js";

const router = Router()

router.post('/create-feedback', adminAuth, mediaUpload('feedback').fields([
        { name: 'feedbackClientImage', maxCount: 1 },
        { name: 'feedbackLogoImage', maxCount: 1 },
        { name: 'feedbackRightImage', maxCount: 1 },
    ]), createFeedback )

router.get('/getFeedbacks', getFeedbacks)

router.route('/:feedbackId')
    .patch(
        adminAuth,
        mediaUpload('feedback').fields([ 
            { name: 'feedbackClientImage', maxCount: 1 },
            { name: 'feedbackLogoImage', maxCount: 1 },
            { name: 'feedbackRightImage', maxCount: 1 },
        ]),
        updateFeedback
    )
    .delete(
        adminAuth,
        deleteFeedback
    );

    

export default router