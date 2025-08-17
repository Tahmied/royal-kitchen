import fs from 'fs';
import { Admin } from '../models/admin.model.js';
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
