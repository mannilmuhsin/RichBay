const mongoose=require('mongoose')
const schema=mongoose.Schema
const userschema=new schema({
    username:{
        type:String,
        required:false
        
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    access:{
        type:Boolean,
        default:true,
        required:true
    },
    verifide:{
        type:Boolean,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    isadmin:{
        type:Boolean,
        require:true
    },
    wishlist:[
    {type:mongoose.Schema.Types.ObjectId,ref:"paroduct"}
    ]
})

module.exports=mongoose.model('users',userschema)