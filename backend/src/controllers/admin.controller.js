import { stringify } from 'csv-stringify';
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
    throw new ApiError(500, `Failed to generate tokens ${err}`);
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

export const getLeads = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, tag, startDate, endDate } = req.query;

    const query = {};
    if (status) query.status = status;
    if (tag) query.tag = tag;
    if (startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const totalLeads = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    const totalPages = Math.ceil(totalLeads / limit);

    return res.status(200).json(
        new ApiResponse(200, { page: Number(page), limit: Number(limit), totalLeads, totalPages, leads }, 'Leads fetched successfully with applied filters')
    );
});

export const editLead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, message, status, tag, notes, followUpDate, assignedTo, assignedToModel } = req.body;
    const userRole = req.user.role; 

    if (!id) {
        throw new ApiError(400, 'Lead ID is required');
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email.trim();
    if (phone) updateFields.phone = phone.trim();
    if (message) updateFields.message = message;
    if (status) updateFields.status = status;
    if (tag) updateFields.tag = tag;
    if (notes) updateFields.notes = notes;
    
    if (followUpDate) updateFields.followUpDate = new Date(followUpDate);

    if (userRole === 'Admin') {
        if (assignedTo) updateFields.assignedTo = assignedTo;
        if (assignedToModel) updateFields.assignedToModel = assignedToModel;
    } else if (assignedTo || assignedToModel) {
        throw new ApiError(403, 'Permission denied. You cannot change lead assignments.');
    }

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, 'At least one field should be provided for update');
    }

    const updatedLead = await Lead.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
    );

    if (!updatedLead) {
        throw new ApiError(404, 'Unable to find the lead to edit');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedLead, 'Lead updated successfully')
    );
});

export const assignLead = asyncHandler(async (req, res) => {
    const { leadIds, userId, role } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0 || !userId || !role) {
        throw new ApiError(400, 'An array of Lead IDs, a User ID, and a role are all required.');
    }

    if (!['Admin', 'Sales'].includes(role)) {
        throw new ApiError(400, 'Invalid role provided.');
    }

    const result = await Lead.updateMany(
        { _id: { $in: leadIds } }, 
        {
            $set: {
                assignedTo: userId,
                assignedToModel: role
            }
        }
    );

    if (result.modifiedCount === 0) {
        return res.status(404).json(
            new ApiResponse(404, null, 'No leads were found to be updated.')
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { modifiedCount: result.modifiedCount },
            `Successfully assigned ${result.modifiedCount} lead(s).`
        )
    );
});

export const deleteLead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Lead ID is required for deletion');
    }

    const deletedLead = await Lead.findByIdAndDelete(id);

    if (!deletedLead) {
        throw new ApiError(404, 'Lead not found or already deleted');
    }

    return res.status(200).json(
        new ApiResponse(200, null, 'Lead deleted successfully')
    );
});

export const getFollowUpLeadsAdmin = asyncHandler(async (req, res) => {
  
    if (req.user.role !== 'Admin') {
        throw new ApiError(403, 'Permission denied. Only admins can view all follow-up leads.');
    }

    const allFollowUpLeads = await Lead.find({
        followUpDate: { $lte: new Date() }
    });

    if (!allFollowUpLeads || allFollowUpLeads.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], 'No follow-up leads found at this time.')
        );
    }

    return res.status(200).json(
        new ApiResponse(200, allFollowUpLeads, 'All follow-up leads fetched successfully')
    );
});

export const exportLeads = asyncHandler(async (req, res) => {
    if (req.user.role !== 'Admin') {
        throw new ApiError(403, 'Permission denied. Only admins can export data.');
    }

    const leads = await Lead.find().lean(); 

    const columns = [
        'ID', 'Name', 'Email', 'Phone', 'Message', 
        'Status', 'Tag', 'Notes', 'Follow Up Date', 
        'Created At', 'Updated At'
    ];

    const data = leads.map(lead => [
        lead._id, lead.name, lead.email, lead.phone, lead.message,
        lead.status, lead.tag, lead.notes, lead.followUpDate,
        lead.createdAt, lead.updatedAt
    ]);

    stringify(data, { header: true, columns: columns }, (err, csvString) => {
        if (err) {
            throw new ApiError(500, 'Failed to generate CSV file');
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
        return res.status(200).send(csvString);
    });
});

export const getLeadById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Lead ID is required');
    }

    const lead = await Lead.findById(id);

    if (!lead) {
        throw new ApiError(404, 'Lead not found.');
    }

    return res.status(200).json(
        new ApiResponse(200, lead, 'Lead fetched successfully.')
    );
});

export const bulkUpdateLeads = asyncHandler(async (req, res) => {
    const { leadIds, updates } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0 || !updates) {
        throw new ApiError(400, 'An array of lead IDs and update fields are required.');
    }
    
    const allowedUpdates = {};
    if (updates.status) allowedUpdates.status = updates.status;
    if (updates.tag) allowedUpdates.tag = updates.tag;
    if (updates.notes) allowedUpdates.notes = updates.notes;
    if (updates.followUpDate) allowedUpdates.followUpDate = new Date(updates.followUpDate);

    if (Object.keys(allowedUpdates).length === 0) {
        throw new ApiError(400, 'No valid update fields provided.');
    }

    const result = await Lead.updateMany(
        { _id: { $in: leadIds } },
        { $set: allowedUpdates }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            { modifiedCount: result.modifiedCount },
            `Successfully updated ${result.modifiedCount} lead(s).`
        )
    );
});

export const bulkDeleteLeads = asyncHandler(async (req, res) => {
    const { leadIds } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
        throw new ApiError(400, 'An array of lead IDs is required for bulk deletion.');
    }

    const result = await Lead.deleteMany({
        _id: { $in: leadIds }
    });

    if (result.deletedCount === 0) {
        return res.status(404).json(
            new ApiResponse(404, null, 'No leads found to delete.')
        );
    }

    return res.status(200).json(
        new ApiResponse(200, { deletedCount: result.deletedCount }, `Successfully deleted ${result.deletedCount} lead(s).`)
    );
});
