import { Lead } from "../models/leads.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js";

export const submitLead = asyncHandler(async (req, res) => {
    const { name, email, phone, message } = req.body;

    if (!email && !phone) {
        throw new ApiError(400, "Either email or phone number is required for contact.");
    }

    try {
        const newLead = await Lead.create({
            name,
            email,
            phone,
            message
        });

        // Email notification logic can be added here
        // sendNewLeadNotification(newLead);

        res.status(201).json(
            new ApiResponse(201, newLead, 'New lead submitted successfully')
        );
    } catch (err) {
        console.error(`Unable to save the lead due to ${err.message}`);
        throw new ApiError(500, "Unable to save the lead. Please try again later.");
    }
});