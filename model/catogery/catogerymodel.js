const mongoose=require('mongoose')
const schema=mongoose.Schema

const catogeryschema=new schema({
    catogeryname:{
        type:String,
        required:true
    }
})


module.exports=mongoose.model('catogery',catogeryschema)