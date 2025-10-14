import fs from 'fs';
import { Feedback } from "../models/feedback.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js";

export const createFeedback = asyncHandler(async (req, res) => {
    const { feedbackClientName, feedbackText, projectLink } = req.body;

    
    if ([feedbackClientName, feedbackText, projectLink].some(field => !field || field.trim() === "")) {
        
        if (req.files) {
            Object.values(req.files).forEach(fileArray => {
                if (fileArray && fileArray.length > 0) {
                    fs.unlinkSync(fileArray[0].path);
                }
            });
        }
        throw new ApiError(400, "All feedback text fields are required");
    }

    
    if (!req.files || Object.keys(req.files).length < 3) {
        throw new ApiError(400, "All three images for feedback are required");
    }

    const { feedbackClientImage, feedbackLogoImage, feedbackRightImage } = req.files;

    try {
        const newFeedback = await Feedback.create({
            feedbackClientName,
            feedbackText,
            projectLink,
            feedbackClientImagePath: `/uploads/feedback/${feedbackClientImage[0].filename}`,
            feedbackLogoPath: `/uploads/feedback/${feedbackLogoImage[0].filename}`,
            feedbackRightImagePath: `/uploads/feedback/${feedbackRightImage[0].filename}`,
        });

        const createdFeedback = await Feedback.findById(newFeedback._id);
        if (!createdFeedback) {
            throw new ApiError(500, "Something went wrong while creating the feedback");
        }

        return res.status(201).json(
            new ApiResponse(201, createdFeedback, "Feedback created successfully")
        );
    } catch (error) {
        
        if (req.files) {
            Object.values(req.files).forEach(fileArray => {
                if (fileArray && fileArray.length > 0) {
                    fs.unlinkSync(fileArray[0].path);
                }
            });
        }
        throw new ApiError(500, "Failed to create feedback", error.message);
    }
});

export const getFeedbacks = asyncHandler(async (req, res) => {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });

    if (!feedbacks) {
        throw new ApiError(404, "No feedbacks found");
    }

    return res.status(200).json(
        new ApiResponse(200, feedbacks, "Feedbacks fetched successfully")
    );
});

export const updateFeedback = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    const { feedbackClientName, feedbackText, projectLink } = req.body;

    if (!feedbackId) {
        throw new ApiError(400, "Feedback ID is required");
    }

    const oldFeedback = await Feedback.findById(feedbackId);
    if (!oldFeedback) {
        throw new ApiError(404, "Feedback not found");
    }

    const updateData = {};
    if (feedbackClientName && feedbackClientName.trim() !== "") {
        updateData.feedbackClientName = feedbackClientName;
    }
    if (feedbackText && feedbackText.trim() !== "") {
        updateData.feedbackText = feedbackText;
    }
    if (projectLink && projectLink.trim() !== "") {
        updateData.projectLink = projectLink;
    }

    const oldImagePaths = [];

    if (req.files) {
        if (req.files.feedbackClientImage) {
            updateData.feedbackClientImagePath = `/uploads/feedback/${req.files.feedbackClientImage[0].filename}`;
            oldImagePaths.push(oldFeedback.feedbackClientImagePath);
        }
        if (req.files.feedbackLogoImage) {
            updateData.feedbackLogoPath = `/uploads/feedback/${req.files.feedbackLogoImage[0].filename}`;
            oldImagePaths.push(oldFeedback.feedbackLogoPath);
        }
        if (req.files.feedbackRightImage) {
            updateData.feedbackRightImagePath = `/uploads/feedback/${req.files.feedbackRightImage[0].filename}`;
            oldImagePaths.push(oldFeedback.feedbackRightImagePath);
        }
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
        feedbackId,
        { $set: updateData },
        { new: true } 
    );

    if (!updatedFeedback) {
        throw new ApiError(500, "Failed to update feedback in the database");
    }

    oldImagePaths.forEach(path => {
        const fullPath = `./public${path}`;
        fs.unlink(fullPath, (err) => {
            if (err) console.error(`Failed to delete old image: ${fullPath}`, err);
        });
    });

    return res.status(200).json(
        new ApiResponse(200, updatedFeedback, "Feedback updated successfully")
    );
});

export const deleteFeedback = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;

    if (!feedbackId) {
        throw new ApiError(400, "Feedback ID is required");
    }

    const feedbackToDelete = await Feedback.findById(feedbackId);

    if (!feedbackToDelete) {
        throw new ApiError(404, "Feedback not found");
    }

    const imagePathsToDelete = [
        feedbackToDelete.feedbackClientImagePath,
        feedbackToDelete.feedbackLogoPath,
        feedbackToDelete.feedbackRightImagePath
    ];

    const deleteResult = await Feedback.findByIdAndDelete(feedbackId);

    if (!deleteResult) {
        throw new ApiError(500, "Failed to delete feedback from the database");
    }

    imagePathsToDelete.forEach(path => {
        if (path) {
            const fullPath = `./public/${path}`;
            fs.unlink(fullPath, (err) => {
                if (err) console.error(`Failed to delete image file: ${fullPath}`, err);
            });
        }
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Feedback deleted successfully")
    );
});