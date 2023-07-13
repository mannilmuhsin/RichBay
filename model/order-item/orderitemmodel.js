

const mongoose=require('mongoose')


const orderitemschema=mongoose.Schema({
    quantity:{
        type:Number,
        required:true
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'paroduct',
        required:true
    }
})

module.exports=mongoose.model('orderitem',orderitemschema)