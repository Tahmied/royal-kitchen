import { Lead } from '../models/leads.model.js';
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js";

export const getFollowUpLeads = asyncHandler(async (req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(400 , 'unable to find the sales person')
    }

    const leads = await Lead.find({
        assignedTo: user._id,
        followUpDate: { $lte: new Date() } 
    });

    return res.status(200).json(
        new ApiResponse(200, leads, 'Follow-up leads fetched successfully')
    );
});
