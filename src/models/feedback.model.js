import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema(
    {
        feedbackClientName: {
            type: String,
            required: true,
            trim: true,
        },
        feedbackText: {
            type: String,
            required: true,
        },
        feedbackClientImagePath: {
            type: String, 
            required: true,
        },
        feedbackLogoPath: {
            type: String,
            required: true,
        },
        feedbackRightImagePath: {
            type: String, 
            required: true,
        },
        projectLink: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);