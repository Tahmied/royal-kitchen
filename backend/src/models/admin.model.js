import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
        default : 'Admin'
    }
}, {
    timestamps : true
})


adminSchema.pre('save' , async function (next) {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password , 10)
    }
})

adminSchema.methods.isAdminPassCorrect = async function (password) {
    return bcrypt.compare(password , this.password)
}

adminSchema.methods.generateAccessTokenAdmin = function () {
    jwt.sign({
        _id : this._id,
        email : this.email
    }, process.env.ACCESS_TOKEN_KEY , {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    })
}

adminSchema.methods.generateRefreshTokenAdmin = function () {
  jwt.sign({
        _id : this._id,
        email : this.email
    }, process.env.ADMIN_REFRESH_TOKEN_KEY , {
        expiresIn : process.env.ADMIN_REFRESH_TOKEN_EXPIRY
    })
}


export const Admin = mongoose.model('Admin' , adminSchema)