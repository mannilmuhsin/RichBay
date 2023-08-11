const mongoose=require('mongoose')

const coupenschema= new mongoose.Schema({
    couponName:{
        type:String,
        required:true,
        unique:true,
        uppercase:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    minAmount:{
        type:Number,
        required:true
    },
    maxAmount:{
        type:Number,
        required:true
    },
    valid:{
        type:Boolean,
        default:true
    },
    slug:{
        type:String
    }
})

module.exports=mongoose.model("coupen",coupenschema)