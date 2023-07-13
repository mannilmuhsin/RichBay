

const mongoose=require('mongoose')
const schema=mongoose.Schema

const addressschema=new schema({
    userid:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    pin:{
        type:Number,
        required:true
    },
    locality:{
        type:String
    },
    address:{
        type:String,
        required:true
    },
    city:{
        type:String
    },
    state:{
        type:String
    }

})

module.exports=mongoose.model('address',addressschema)