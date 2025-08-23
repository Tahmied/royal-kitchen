import fs from 'fs';
import { Project } from '../models/projects.model.js';
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js";

export const createProject = asyncHandler(async (req, res) => {
    const { projectName, projectContent } = req.body;

    // Check for required text fields
    if ([projectName, projectContent].some(field => !field)) {
        throw new ApiError(400, "Project name and content are required.");
    }
    
    // Check for required files
    const files = req.files;
    if (!files || !files['homepageImages'] || files['homepageImages'].length !== 6 || !files['videoThumbnail'] || !files['video']) {
        // Clean up uploaded files if validation fails
        const uploadedFiles = Object.values(files).flat();
        uploadedFiles.forEach(file => fs.unlinkSync(file.path));
        throw new ApiError(400, "6 homepage images, a video thumbnail, and a video file are required.");
    }

    // Get file paths
    const homepageImagePaths = files['homepageImages'].map(file => `/uploads/projects/${file.filename}`);
    const videoThumbnailPath = `/uploads/projects/${files['videoThumbnail'][0].filename}`;
    const videoPath = `/uploads/projects/${files['video'][0].filename}`;

    const newProject = await Project.create({
        projectName,
        homepageImages: homepageImagePaths,
        videoThumbnailPath,
        videoPath,
        projectContent
    });

    if (!newProject) {
        throw new ApiError(500, "Failed to create new project.");
    }

    return res.status(201).json(
        new ApiResponse(201, newProject, "Project created successfully.")
    );
});

export const getAllProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({});

    return res.status(200).json(
        new ApiResponse(200, projects, "All projects fetched successfully.")
    );
});

export const updateProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { projectName, projectContent } = req.body;
    const files = req.files;

    const project = await Project.findById(id);

    if (!project) {
        if (files) {
            Object.values(files).flat().forEach(file => fs.unlinkSync(file.path));
        }
        throw new ApiError(404, "Project not found.");
    }

    // Update text fields if provided
    if (projectName) project.projectName = projectName;
    if (projectContent) project.projectContent = projectContent;

    // Handle homepage image updates
    if (files && files['homepageImages']) {
        // Delete old image files
        project.homepageImages.forEach(imagePath => {
            try {
                fs.unlinkSync(`.${imagePath}`);
            } catch (error) {
                console.warn(`Could not delete old image at .${imagePath}`);
            }
        });
        // Save new image paths
        project.homepageImages = files['homepageImages'].map(file => `/projects/images/${file.filename}`);
    }

    // Handle video thumbnail update
    if (files && files['videoThumbnail']) {
        if (project.videoThumbnailPath) {
            try {
                fs.unlinkSync(`.${project.videoThumbnailPath}`);
            } catch (error) {
                console.warn(`Could not delete old video thumbnail at .${project.videoThumbnailPath}`);
            }
        }
        project.videoThumbnailPath = `/projects/images/${files['videoThumbnail'][0].filename}`;
    }

    // Handle video update
    if (files && files['video']) {
        if (project.videoPath) {
            try {
                fs.unlinkSync(`.${project.videoPath}`);
            } catch (error) {
                console.warn(`Could not delete old video at .${project.videoPath}`);
            }
        }
        project.videoPath = `/projects/videos/${files['video'][0].filename}`;
    }
    
    // Save the updated project document
    const updatedProject = await project.save();

    return res.status(200).json(
        new ApiResponse(200, updatedProject, "Project updated successfully.")
    );
});

export const deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
        throw new ApiError(404, "Project not found.");
    }

    // Delete all associated files from the server
    const allFilePaths = [
        ...project.homepageImages,
        project.videoThumbnailPath,
        project.videoPath
    ];

    allFilePaths.forEach(filePath => {
        try {
            if (filePath) {
                fs.unlinkSync(`.${filePath}`);
            }
        } catch (error) {
            console.warn(`Could not delete file at .${filePath}`);
        }
    });

    // Delete the document from the database
    await Project.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, null, "Project deleted successfully.")
    );
});

export const getPublicProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({}, {
        _id: 1,
        projectName: 1,
        homepageImages: 1,
        videoThumbnailPath: 1,
        videoPath: 1
    });

    return res.status(200).json(
        new ApiResponse(200, projects, "Public projects fetched successfully.")
    );
});

export const getProjectById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    if (!id) {
        throw new ApiError(400, "Project ID is required.");
    }

    const project = await Project.findById(id);

    if (!project) {
        throw new ApiError(404, "Project not found.");
    }

    return res.status(200).json(
        new ApiResponse(200, project, "Project details fetched successfully.")
    );
});

// handle file upload for content

export const uploadContentImage = asyncHandler(async (req, res) => {

    if (!req.file) {
        throw new ApiError(400, "Image file is required.");
    }

    const imageUrl = `/uploads/project-content-images/${req.file.filename}`;

    return res.status(200).json(
        new ApiResponse(200, { url: imageUrl }, "Image uploaded successfully.")
    );
});
