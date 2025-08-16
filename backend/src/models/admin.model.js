import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true,
        trim : true
    },
    lastName : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        trim : true,
        lowercase : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    dpLocalPath : {
        type: String,
        required : false
    },
    role : {
        enum : ['Admin' , 'SalesPerson']
    },
    isActive : {
        type : Boolean,
        required : false,
        default : true
    },
    refreshToken : {
        type : String
    },
    accessToken : {
        type : String
    }
}, {
    timestamps : true
})

export const Admin = mongoose.model('Admin' , adminSchema)