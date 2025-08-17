import fs from 'fs';
import { Admin } from '../models/admin.model.js';
import { Lead } from '../models/leads.model.js';
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshTokenAdmin = async (id) => {
  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    const accessToken = await admin.generateAccessTokenAdmin();
    const refreshToken = await admin.generateRefreshTokenAdmin();

    if (!accessToken || !refreshToken) {
      throw new ApiError(500, "Unable to generate tokens");
    }

    await Admin.findByIdAndUpdate(
      id,
      { $set: { refreshToken } },
      { new: true, validateBeforeSave: false }
    );

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(500, "Failed to generate tokens", err);
  }
};


// auth controllers

export const registerAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if ([firstName, lastName, email, password].some((e) => !e)) {
    throw new ApiError(400, "All input fields are required");
  }

  const profilePic = req.file ? `/dp/${req.file.filename}` : null;

  try {
    const newAdmin = await Admin.create({
      firstName,
      lastName,
      email,
      password,
      dpLocalPath: profilePic,
    });

    const { password: _, ...safeAdmin } = newAdmin.toObject();

    res.status(201).json(
      new ApiResponse(201, safeAdmin, "New admin registered successfully")
    );
  } catch (err) {
    console.error(`Unable to register admin due to ${err}`);
    if (req.file) fs.unlinkSync(req.file.path);
    throw new ApiError(500, "Unable to register admin", err);
  }
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All login input fields are required");
  }


  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new ApiError(404, "No admin account found with that email");
  }

  const isPassCorrect = await admin.isAdminPassCorrect(password);
  if (!isPassCorrect) {
    throw new ApiError(400, "Wrong password");
  }

  if (!admin.isActive) {
    throw new ApiError(403, "Account is not active");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokenAdmin(admin._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  };

  const { password: _, refreshToken: __, ...safeAdmin } = admin.toObject();

  return res
    .status(200)
    .cookie("AdminAccessToken", accessToken, cookieOptions)
    .cookie("AdminRefreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, safeAdmin, "Admin login successful"));
});

export const checkAdminLogin = asyncHandler(async (req,res)=>{

    const admin = req.user
    
    if(!admin){
        return res.status(401).json(new ApiResponse(401, null, 'admin not found'))
    }


    return res.status(200).json(
        new ApiResponse(200 , {"name" : admin.firstName , "email" : admin.email}, 'admin is logged in')
    )
})

export const logout = asyncHandler(async (req, res) => {
  const admin = req.user;
  if (!admin) {
    return res.status(401).json(
      new ApiResponse(401, null, 'Not logged in')
    );
  }

  admin.refreshToken = null;
  await admin.save();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: '/'
  };

  return res.status(200)
    .clearCookie('AdminAccessToken', cookieOptions)
    .clearCookie('AdminRefreshToken', cookieOptions)
    .json(new ApiResponse(200, null, 'Admin logged out'));
});


// leads

export const getLeads = asyncHandler (async (req,res)=>{

  const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
  const skip  = (page - 1) * limit;
  const totalLeads = await Lead.countDocuments()
  const leads = await Lead.find()
  .sort({createdAt: -1})
  .skip(skip)
  .limit(limit)
  .lean()
  let response = {
    page , limit , totalLeads, leads
  } 

  return res.status(200).json(
    new ApiResponse(200 , response , 'leads fetched')
  )
  
})

export const editLead = asyncHandler ( async (req,res)=>{

  const {id, name, email, phone, message, status, tag, notes} = req.body

  if(!name && !email && !phone && !message && status && tag && notes){
    throw new ApiError(400 , 'at least one of the fields should be filled')
  }

  if(!id){
    throw new ApiError(400 , 'lead id is required')
  }

  const lead = await Lead.findById({id})
  if(!lead){
    throw new ApiError(404, 'unable to find the lead to edit')
  }

  if(name !== undefined) lead.name = name
  if(email !== undefined) lead.email = email.trim()
  if(phone !== undefined) lead.phone = phone.trim()
  if(message !== undefined) lead.message = message
  if(status !== undefined) lead.status = status
  const validStatus = ['New', 'Called','Trash']
  if(!validStatus.includes(status)){
    throw new ApiError(400, `valid status are - ${validStatus.join(', ')}`)
  }
  if(tag !== undefined) lead.tag = tag
  if(notes !== notes) lead.notes = notes

  await lead.save()
  return res.status(201).json(
    new ApiResponse(201 , lead , 'lead updated successfully')
  )

})