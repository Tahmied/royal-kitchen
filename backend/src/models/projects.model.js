import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    homepageImages: {
        type: [String], 
        required: true,
        validate: {
            validator: function(v) {
                return v.length === 6; 
            },
            message: props => `${props.path} must contain exactly 6 image paths!`
        }
    },
    videoThumbnailPath: {
        type: String,
        required: true
    },
    videoPath: {
        type: String,
        required: true
    },
    projectContent: {
        type: String,
        required: true
    }
}, {
    timestamps: true 
});

export const Project = mongoose.model('Project', projectSchema);