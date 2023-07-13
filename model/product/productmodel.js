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
    image:{
        type:Object,
        required:true
    }
})

module.exports=mongoose.model('paroduct',productschema)