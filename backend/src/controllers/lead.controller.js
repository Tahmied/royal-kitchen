import { Lead } from "../models/leads.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js";

export const submitLead = asyncHandler( async (req,res)=> {
    const {name , email, phone, message} = req.body

    try {
        const newLead = await Lead.create({
            name , email, phone, message
        })
        res.status(200).json(
            new ApiResponse(201, newLead , 'New lead submitted successfully')
        )
    } catch (err) {
        console.log(`unable to save the lead due to ${err}`)
        throw new ApiError(500 , `unable to save the lead due to ${err}`)
    }

})