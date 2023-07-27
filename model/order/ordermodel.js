

const mongoose=require('mongoose')

const orderschema=mongoose.Schema({
    orderitems:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'orderitem',
        // required:true
    }],
    shippingaddress:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'address',
        required:true
    },
    status:{
        type:String,
        default:"Pending",
        required:true,
    },
    totalprice:{
        type:Number,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    dateorder:{
        type:Date,
        default:Date.now(),
        
    },
    Paymentmethod:{
        
            type:String,
        required:true

       
    },
    shippingmethod:{
        type:String,
        required:true

    }

})


module.exports=mongoose.model('order',orderschema)