import { Router } from "express";
import { createProject, deleteProject, getAllProjects, getProjectById, getPublicProjects, updateProject, uploadContentImage } from "../controllers/project.controller.js";
import { adminAuth } from "../middlewares/auth.middleware.js";
import { mediaUpload } from "../middlewares/multer.middleware.js";


const router =  Router()


router.route('/createProject').post(adminAuth, mediaUpload('/projects').fields([
        { name: 'homepageImages', maxCount: 6 },
        { name: 'videoThumbnail', maxCount: 1 },
        { name: 'video', maxCount: 1 }
    ]), createProject);
router.route('/getAllProjects').get(adminAuth, getAllProjects);  
router.route('/admin/:id').put(adminAuth, mediaUpload('/projects').fields([
        { name: 'homepageImages', maxCount: 6 },
        { name: 'videoThumbnail', maxCount: 1 },
        { name: 'video', maxCount: 1 }
    ]), updateProject)
    .delete(adminAuth, deleteProject);

// Public-facing Project Routes
router.route('/public').get(getPublicProjects);
router.route('/public/:id').get(getProjectById);

// handle file upload for content
router.route('/upload-content-image').post(adminAuth, mediaUpload('/project-content-images').single('image'), uploadContentImage);


export default router