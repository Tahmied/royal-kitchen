import fs from 'fs';
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

    const accessToken = await salesPerson.generateAccessTokenSales();
    const refreshToken = await salesPerson.generateRefreshTokenSales();

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
    throw new ApiError(500, `Failed to generate tokens ${err}`);
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
      new ApiResponse(201, safeSalesPerson, "New sales person registered successfully")
    );
  } catch (err) {
    console.error(`Unable to register sales person due to ${err}`);
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
    throw new ApiError(404, "No sales account found with that email");
  }

  const isPassCorrect = await salesPerson.isSalesPassCorrect(password);
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
    .json(new ApiResponse(200, safeSalesPerson, "Sales Person login successful"));
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
    .json(new ApiResponse(200, null, 'Sales person logged out'));
});

// lead management

export const getFollowUpLeads = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const user = req.user;

    const query = {
        assignedTo: user._id,
        assignedToModel: 'Sales',
        followUpDate: { $lte: new Date() }
    };
    
    const totalLeads = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
        .sort({ followUpDate: 1 }) // Sort by earliest follow-up date first
        .skip((page - 1) * limit)
        .limit(limit);

    const totalPages = Math.ceil(totalLeads / limit);

    return res.status(200).json(
        new ApiResponse(200, { page: Number(page), limit: Number(limit), totalLeads, totalPages, leads }, 'Follow-up leads fetched successfully')
    );
});

export const getAssignedLeads = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 20, 
        status, 
        tag, 
        startDate, 
        endDate, 
        search, 
        followUpFrom, 
        followUpTo 
    } = req.query;
    const salespersonId = req.user._id;

    // 1. Build the query object
    const query = {
        assignedTo: salespersonId,
        assignedToModel: 'Sales'
    };

    // Filter by status and tag
    if (status) query.status = status;
    if (tag) query.tag = tag;

    // Add multi-field search functionality
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
            { name: { $regex: searchRegex } },
            { email: { $regex: searchRegex } },
            { phone: { $regex: searchRegex } },
            { company: { $regex: searchRegex } },
            { message: { $regex: searchRegex } },
            { notes: { $regex: searchRegex } }
        ];
    }
    
    // Filter by Creation Date
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Filter by Follow-up Date
    if (followUpFrom || followUpTo) {
        query.followUpDate = {};
        if (followUpFrom) query.followUpDate.$gte = new Date(followUpFrom);
        if (followUpTo) query.followUpDate.$lte = new Date(followUpTo);
    }

    // 2. Execute the database queries
    const totalLeads = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    const totalPages = Math.ceil(totalLeads / limit);

    // 3. Return the response
    return res.status(200).json(
        new ApiResponse(200, { page: Number(page), limit: Number(limit), totalLeads, totalPages, leads }, 'Assigned leads fetched successfully with applied filters')
    );
});

export const updateLead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, tag, notes, followUpDate } = req.body;
    const salespersonId = req.user._id;

    if (!id) {
        throw new ApiError(400, 'Lead ID is required.');
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (tag) updateFields.tag = tag;
    if (notes) updateFields.notes = notes;
    if (followUpDate) updateFields.followUpDate = new Date(followUpDate);

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, 'At least one field (status, tag, notes, or followUpDate) is required for update.');
    }

    // Find the lead and ensure it's assigned to the current salesperson before updating
    const updatedLead = await Lead.findOneAndUpdate(
        { _id: id, assignedTo: salespersonId, assignedToModel: 'Sales' },
        { $set: updateFields },
        { new: true, runValidators: true }
    );

    if (!updatedLead) {
        throw new ApiError(404, 'Lead not found or you are not authorized to update this lead.');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedLead, 'Lead updated successfully.')
    );
});

export const getLeadById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const salespersonId = req.user._id;

    if (!id) {
        throw new ApiError(400, 'Lead ID is required.');
    }

    // Find the lead and ensure it's assigned to the current salesperson
    const lead = await Lead.findOne({
        _id: id,
        assignedTo: salespersonId,
        assignedToModel: 'Sales'
    }).lean();

    if (!lead) {
        throw new ApiError(404, 'Lead not found or you are not authorized to view it.');
    }

    return res.status(200).json(
        new ApiResponse(200, lead, 'Lead details fetched successfully.')
    );
});

export const getLeadsSummary = asyncHandler(async (req, res) => {
    const salespersonId = req.user._id;

    // 1. Count the total number of assigned leads
    const totalLeads = await Lead.countDocuments({
        assignedTo: salespersonId,
        assignedToModel: 'Sales'
    });

    // 2. Count the number of new leads
    const newLeads = await Lead.countDocuments({
        assignedTo: salespersonId,
        assignedToModel: 'Sales',
        status: 'New'
    });

    // 3. Count the number of leads with a follow-up date
    const followUpLeads = await Lead.countDocuments({
        assignedTo: salespersonId,
        assignedToModel: 'Sales',
        followUpDate: { $exists: true, $ne: null }
    });

    const summary = {
        totalAssignedLeads: totalLeads,
        newLeads: newLeads,
        followUpLeads: followUpLeads
    };

    return res.status(200).json(
        new ApiResponse(200, summary, 'Leads summary fetched successfully.')
    );
});
