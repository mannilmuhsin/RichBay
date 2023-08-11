
const mongoose=require('mongoose')
const schema=mongoose.Schema

const cartschema=new schema({
    userid:{
        type:String,
        required:true
    },
    items:[
        {
            productid:{
                type:String,
                required:true
            },
            productname:{
                type:String,
                required:true
            },
            productprice:{
                type:Number,
                required:true
            },
            productimage:{
                url:{
                    type:String,
                    required:true
                },
                public_id:{
                    type:String,
                    required:true
                }
            },
            quantity:{
                type:Number,
               default:1
            },
            totalprice:{
                type:Number,
                required:true
            },
            date:{
                type:Date,
                default:Date.now()
            }

        }
    ],
    cartprice:{
        type:Number,
        required:true
    }
})

module.exports=mongoose.model('cart',cartschema)