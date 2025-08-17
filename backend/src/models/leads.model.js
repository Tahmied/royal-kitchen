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
        enum: ['New', 'Contacted', 'In Progress', 'Closed', 'Trash'] 
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
    }
}, {
    timestamps: true
});

export const Lead = mongoose.model('Lead', leadSchema);