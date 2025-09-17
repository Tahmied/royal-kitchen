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
