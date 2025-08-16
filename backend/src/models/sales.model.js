import mongoose from "mongoose";

const salesSchema = new mongoose.Schema ({
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
    },
    role : {
        type : String,
        default : "sales"
    }
}, {
    timestamps : true
})

export const Sales = mongoose.model('Sales' , salesSchema)