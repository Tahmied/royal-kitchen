import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
    name : {
        type : String,
        required: true
    },
    email : {
        type : String,
        trim : true,
        lowercase : true,
        unique : true
    },
    phone : {
        type : String,
        trim : true , 
        unique : true
    },
    message : {
        type : String,
    },
    status : {
        type : String,
        default : 'New',
        enum : ['New', 'Called','Trash']
    },
    tag : {
        type : String,
        default : ''
    },
    notes : {
        type : String,
        default : ''
    }
})

export const Lead = mongoose.model('Lead' , leadSchema)