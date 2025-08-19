import { Lead } from '../models/leads.model.js';
import { Sales } from '../models/sales.model.js';
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshTokenSales = async (id) => {
  try {
    const salesPerson = await Sales.findById(id);
    if (!salesPerson) {
      throw new ApiError(404, "salesperson not found");
    }

    const accessToken = await salesPerson.generateAccessTokenAdmin();
    const refreshToken = await salesPerson.generateRefreshTokenAdmin();

    if (!accessToken || !refreshToken) {
      throw new ApiError(500, "Unable to generate tokens");
    }

    await Sales.findByIdAndUpdate(
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

export const registerSalesPerson = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if ([firstName, lastName, email, password].some((e) => !e)) {
    throw new ApiError(400, "All input fields are required");
  }

  const profilePic = req.file ? `/dp/${req.file.filename}` : null;

  try {
    const newSalesPerson = await Sales.create({
      firstName,
      lastName,
      email,
      password,
      dpLocalPath: profilePic,
    });

    const { password: _, ...safeSalesPerson } = newSalesPerson.toObject();

    res.status(201).json(
      new ApiResponse(201, safeSalesPerson, "New admin registered successfully")
    );
  } catch (err) {
    console.error(`Unable to register admin due to ${err}`);
    if (req.file) fs.unlinkSync(req.file.path);
    throw new ApiError(500, "Unable to register sales person", err);
  }
});

export const loginSalesPerson = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All login input fields are required");
  }


  const salesPerson = await Sales.findOne({ email });
  if (!salesPerson) {
    throw new ApiError(404, "No admin account found with that email");
  }

  const isPassCorrect = await salesPerson.isAdminPassCorrect(password);
  if (!isPassCorrect) {
    throw new ApiError(400, "Wrong password");
  }

  if (!salesPerson.isActive) {
    throw new ApiError(403, "Account is not active");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokenSales(salesPerson._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  };

  const { password: _, refreshToken: __, ...safeSalesPerson } = salesPerson.toObject();

  return res
    .status(200)
    .cookie("SalesAccessToken", accessToken, cookieOptions)
    .cookie("SalesRefreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, safeSalesPerson, "Admin login successful"));
});

export const checkSalesPersonLogin = asyncHandler(async (req,res)=>{

    const salesPerson = req.user
    
    if(!salesPerson){
        return res.status(401).json(new ApiResponse(401, null, 'salesperson not found'))
    }


    return res.status(200).json(
        new ApiResponse(200 , {"name" : salesPerson.firstName , "email" : salesPerson.email}, 'salesperson is logged in')
    )
})

export const logout = asyncHandler(async (req, res) => {
  const salesPerson = req.user;
  if (!salesPerson) {
    return res.status(401).json(
      new ApiResponse(401, null, 'Not logged in')
    );
  }

  salesPerson.refreshToken = null;
  await salesPerson.save();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: '/'
  };

  return res.status(200)
    .clearCookie('SalesAccessToken', cookieOptions)
    .clearCookie('SalesRefreshToken', cookieOptions)
    .json(new ApiResponse(200, null, 'Admin logged out'));
});

// lead management

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
