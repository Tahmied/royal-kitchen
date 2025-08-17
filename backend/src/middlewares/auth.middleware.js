import jwt from 'jsonwebtoken';
import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js";


export const auth = asyncHandler(async(req,res,next)=>{
    try {
        const accessToken = req.cookies?.AdminAccessToken || req.header('Authorization')?.replace('Bearer ', '')
        if(!accessToken){
            throw new ApiError(401, 'token is missing')
        }
        const decodedToken = jwt.verify(accessToken , process.env.ADMIN_ACCESS_TOKEN_KEY)
        if(!decodedToken){
            throw new ApiError(401, 'invalid token')
        }
        const admin = await Admin.findById(decodedToken._id)
        if(!admin){
            return res.status(401).json(new ApiResponse(401, null, 'admin not found'))
        }
        req.user = admin
        next()
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
          return res.status(401).json(new ApiResponse(401, null, 'Invalid or expired token'));
        }
        throw new ApiError(401 , `auth middleware error ${err}`)
    }
})