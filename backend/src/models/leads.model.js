import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        trim: true
    },
    message: {
        type: String,
    },
    status: {
        type: String,
        default: 'New',
        enum: ['New', 'Contacted', 'in-progress', 'Closed', 'Trash'] 
    },
    tag: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    followUpDate: {
        type: Date,
        default: null
    },
    assignedSalesperson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'assignedToModel', 
        default: null
    },
    assignedToModel: { 
        type: String,
        enum: ['Admin', 'Sales'], 
        default: null
    },
}, {
    timestamps: true
});

export const Lead = mongoose.model('Lead', leadSchema);