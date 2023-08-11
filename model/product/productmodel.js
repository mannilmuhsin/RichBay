const { json } = require('body-parser')
const mongoose=require('mongoose')
const schema=mongoose.Schema

const productschema=new schema({
    productname:{
        type:String,
        required:true
    },
    catogery:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'catogery',
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:[{
        url:{
            type:String,
            required:true
        },
        public_id:{
            type:String,
            required:true
        }
    }],
    slug:{
        type:String,
        required:true,
        unique:true
    },
    color:{
        type:String,
       
    },
    ratings:[{
        star:Number,
        postedby:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
    }],
    brand:{
        type:String,
        
    },
    date:{
        type:Date,
        default:Date.now()
    },
    sold:{
        type:Number,
        default:0,
        select:false
    }
},{timestamps:true})

module.exports=mongoose.model('paroduct',productschema)