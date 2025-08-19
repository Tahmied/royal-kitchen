import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

salesSchema.pre('save' , async function (next) {
    if(this.isModified('password')) {
       this.password = await bcrypt.hash(this.password , 10)
    }
    next()
})

salesSchema.methods.isSalesPassCorrect = async function (password) {
    return bcrypt.compare(password , this.password)
}

salesSchema.methods.generateAccessTokenSales = function () {
    return jwt.sign({
        _id : this._id,
        email : this.email
    }, process.env.SALES_ACCESS_TOKEN_KEY , {
        expiresIn : process.env.SALES_ACCESS_TOKEN_EXPIRY
    })
}


salesSchema.methods.generateRefreshTokenSales = function () {
    return jwt.sign({
        _id : this._id,
        email : this.email
    }, process.env.SALES_REFRESH_TOKEN_KEY , {
        expiresIn : process.env.SALES_REFRESH_TOKEN_EXPIRY
    })
}

export const Sales = mongoose.model('Sales' , salesSchema)