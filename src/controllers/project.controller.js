import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Project } from '../models/projects.model.js';
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js";

// utility functions
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeStoredPath(stored) {
  if (!stored) return null;
  let p = stored.split('?')[0];

  try {
    const maybeUrl = new URL(p);
    p = maybeUrl.pathname;
  } catch (e) {
  }

  p = p.replace(/^\.?\/+/, '');

  if (!p.startsWith('public/')) p = path.join('public', p);

  return path.normalize(p);
}

async function deleteFileFromPublic(stored) {
  const rel = normalizeStoredPath(stored);
  if (!rel) return false;

  const abs = path.resolve(process.cwd(), rel);

  const alt = path.resolve(__dirname, '..', '..', rel);

  const candidates = [abs, alt];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate); 
      await fs.unlink(candidate);
      
      return true;
    } catch (err) {
    //   console.log(`Tried ${candidate} -> ${err.code || err.message}`);
    }
  }

  console.warn('Could not delete. Stored path:', stored, 'Tried:', candidates);
  return false;
}

// project management controllers

export const createProject = asyncHandler(async (req, res) => {
    const { projectName, projectContent } = req.body;

    if ([projectName, projectContent].some(field => !field)) {
        throw new ApiError(400, "Project name and content are required.");
    }
    
    const files = req.files;
    if (!files || !files['ownerProfileImage'] || !files['homepageImages'] || files['homepageImages'].length !== 6 || !files['videoThumbnail'] || !files['video']) {
        const uploadedFiles = Object.values(files).flat();
        uploadedFiles.forEach(file => fs.unlinkSync(file.path));
        throw new ApiError(400, "6 homepage images, a video thumbnail, and a video file are required.");
    }

    const ownerProfileImagePath = `/uploads/projects/${files['ownerProfileImage'][0].filename}`; 
    const homepageImagePaths = files['homepageImages'].map(file => `/uploads/projects/${file.filename}`);
    const videoThumbnailPath = `/uploads/projects/${files['videoThumbnail'][0].filename}`;
    const videoPath = `/uploads/projects/${files['video'][0].filename}`;

    const newProject = await Project.create({
        projectName, ownerProfileImagePath,
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

    if (projectName) project.projectName = projectName;
    if (projectContent) project.projectContent = projectContent;

    if (files && files['ownerProfileImage']) {
    if (project.ownerProfileImagePath) {
        try {
            fs.unlinkSync(`.${project.ownerProfileImagePath}`);
        } catch (error) {
            console.warn(`Could not delete old profile image at .${project.ownerProfileImagePath}`);
        }
    }
        project.ownerProfileImagePath = `/uploads/projects/${files['ownerProfileImage'][0].filename}`;
    }

    if (files && files['homepageImages']) {
        project.homepageImages.forEach(imagePath => {
            try {
                fs.unlinkSync(`.${imagePath}`);
            } catch (error) {
                console.warn(`Could not delete old image at .${imagePath}`);
            }
        });
        project.homepageImages = files['homepageImages'].map(file => `/uploads/projects/${file.filename}`);
    }

    if (files && files['videoThumbnail']) {
        if (project.videoThumbnailPath) {
            try {
                fs.unlinkSync(`.${project.videoThumbnailPath}`);
            } catch (error) {
                console.warn(`Could not delete old video thumbnail at .${project.videoThumbnailPath}`);
            }
        }
        project.videoThumbnailPath = `/uploads/projects/${files['videoThumbnail'][0].filename}`;
    }

    if (files && files['video']) {
        if (project.videoPath) {
            try {
                fs.unlinkSync(`.${project.videoPath}`);
            } catch (error) {
                console.warn(`Could not delete old video at .${project.videoPath}`);
            }
        }
        project.videoPath = `/uploads/projects/${files['video'][0].filename}`;
    }
    
    const updatedProject = await project.save();

    return res.status(200).json(
        new ApiResponse(200, updatedProject, "Project updated successfully.")
    );
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found.');

  const allFilePaths = [
    ...(project.homepageImages || []),
    project.videoThumbnailPath,
    project.videoPath
  ].filter(Boolean);

  for (const fp of allFilePaths) {
    try {
      await deleteFileFromPublic(fp);
    } catch (e) {
    //   console.warn('Error deleting', fp, e && e.message);
    }
  }

  await Project.findByIdAndDelete(id);
  return res.status(200).json(new ApiResponse(200, null, 'Project deleted successfully.'));
});

export const getPublicProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({}, {
        _id: 1,
        projectName: 1,
        ownerProfileImagePath: 1,
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
