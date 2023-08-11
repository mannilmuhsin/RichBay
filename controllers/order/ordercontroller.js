const addressmodel = require("../../model/address/addressmodel");
const cartmodel = require("../../model/cart/cartmodel");
const ordermodel = require("../../model/order/ordermodel");
const orderitemmodel = require("../../model/order-item/orderitemmodel");
const productmodel = require("../../model/product/productmodel");
const { promises } = require("nodemailer/lib/xoauth2");
const Razorpay= require('razorpay');
const usermodel = require("../../model/user/usermodel");
const coupenmodel = require("../../model/coupen/coupenmodel");
const walletmodel = require("../../model/wallet/walletmodel");
const catogerymodel = require("../../model/catogery/catogerymodel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY
});

const razorpayactive=async (req,res)=>{
  try {
    const user=await usermodel.findOne({_id:req.session.session_id})
    const cart = await cartmodel.findOne({ userid: req.session.session_id });
    let shippingcharge = 0;
    if (req.body.shippingmethod == "standardShipping") {
      shippingcharge = 80;
    }
    if (req.body.shippingmethod == "expressShipping") {
      shippingcharge = 40;
    }
    const coupen = await coupenmodel.findOne({couponName:req.body.coupen})
    let coupencharg=0
    if(coupen){
      coupencharg=coupen.discount
    }
    const totalprice= cart.cartprice + shippingcharge-coupencharg
    
    const amount = totalprice*100
    const options = {
  
        amount: amount,
        currency: 'INR',
        receipt: 'marakadians@gmail.com'
    }

    razorpay.orders.create(options, 
        (err, order)=>{
            if(!err){
              // console.log(req.body)
                res.status(200).send({
                    success:true,
                    msg:'Order Created',
                    order_id:order.id,
                    amount:amount,
                    key_id:process.env.RAZORPAY_KEY,
                    name: user.username,
                    email: user.email
                });
            }
            else{
                res.status(400).send({success:false,msg:'Something went wrong!'});
            }
        }
    );

} catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Something went wrong' });
}
}

//for load checkout

const loadcheckout = async (req, res) => {
  try {
    const cart = await cartmodel.findOne({ userid: req.session.session_id });
    const address = await addressmodel.find({ userid: req.session.session_id });
    const wallet=await walletmodel.findOne({user:req.session.session_id})
    const catogery=await catogerymodel.find()
    const user=await usermodel.findOne({_id:req.session.session_id})
    res.render("./user/checkout", { address, cart ,wallet,catogery,user });
  } catch (error) {
    console.log(error.message);
  }
};

//for creat order

const creatorder = async (req, res) => {
  try {
    let shippingcharge = 0;
    // if (req.body.shippingmethod == "standardShipping") {
    //   shippingcharge = 80;
    // }
    if (req.body.shippingmethod == "expressShipping") {
      shippingcharge = 40;
    }
    

    const cart = await cartmodel.findOne({ userid: req.session.session_id });
    const coupen = await coupenmodel.findOne({couponName:req.body.coupen})
    let coupencharg=0
    if(coupen){
      const dicount=(coupencharg*cart.cartprice)/100
      if(dicount>coupen.maxAmount){
        coupencharg=coupen.maxAmount
      }
      coupencharg=coupen.discount
    }

    const orderitemsids = Promise.all(
      cart.items.map(async (orderitem) => {
        // const pproduct=await productmodel.findOne({_id:orderitem.productid,quantity:{$gt:0}})
        // console.log(pproduct);
        // if(pproduct){

        const neworderitem = new orderitemmodel({
          quantity: orderitem.quantity,
          product: orderitem.productid,
        });
        const orderitems = await neworderitem.save();
        return orderitems._id;
        // }
      })
    );

    const orderitemre = await orderitemsids;
    

    const order = new ordermodel({
      orderitems: orderitemre,
      shippingaddress: req.body.address,
      totalprice: cart.cartprice + shippingcharge-coupencharg,
      user: cart.userid,
      Paymentmethod: req.body.Paymentmethod,
      shippingmethod: req.body.shippingmethod,
    });

    const orders = await order.save();
    cart.items.map(async (orderitem) => {
      const product = await productmodel.findOne({ _id: orderitem.productid });
      await productmodel.updateOne(
        { _id: orderitem.productid },
        { $set: { quantity: product.quantity - orderitem.quantity } }
      );
    });
    const never = await Promise.all(
      cart.items.map(async (orderitem) => {
        const product = await productmodel.findOne({
          _id: orderitem.productid,
        });
        await cartmodel.updateMany(
          {
            "items.productid": orderitem.productid,
            "items.quantity": { $gt: product.quantity },
          },
          { $set: { "items.$.quantity": product.quantity } }
        );
      })
    );

    if(order.Paymentmethod=='wallet'){
      const wallet=await walletmodel.findOne({user:order.user})
      // await walletmodel.updateOne({user:order.user},{$set:{balance:wallet.balance-order.totalprice}})
      let balance = wallet.balance;
      let newBalance = balance - order.totalprice;
      let history = {
          type: "subtract",
          amount: order.totalprice,
          newBalance: newBalance
      }

      wallet.balance = newBalance;
      wallet.history.push(history);
      await wallet.save();
    }

    await cartmodel.deleteOne({ userid: req.session.session_id });
   
    res.status(200).send({
      success:true,
      orderid:orders._id,
      coupen:coupencharg
  });

    
    // res.render('./user/success')
    // console.log(order);
  } catch (error) {
    console.log(error.message);
  }
};

//for cancel order

const cancelorder = async (req, res) => {
  try {
    let order = await ordermodel.findOne({ _id: req.query.orderid });

    order.orderitems.map(async(item)=>{
      const oneitem=await orderitemmodel.findOne({_id:item})
      const product= await productmodel.findOne({_id:oneitem.product})
      await productmodel.updateOne({_id:oneitem.product},{$set:{quantity:product.quantity+oneitem.quantity}})
    })


    if(order.Paymentmethod == "OnlinePayment" || order.Paymentmethod == "wallet"){
      let wallet = await walletmodel.findOne({user: order.user});
      
      if(!wallet){
        wallet = new walletmodel({
          user: order.user,
          balance: order.totalprice,
          history: [{
            type: "add",
            amount: order.totalprice,
            newBalance: order.totalprice
          }]
        })
        
    await wallet.save();
    
    order.status = "cancelled";
    await order.save();
    
  }else{
    let balance = wallet.balance;
    let newBalance = balance + order.totalprice;
    let history = {
      type: "add",
      amount: order.totalprice,
      newBalance: newBalance
    }
    
    wallet.balance = newBalance;
    wallet.history.push(history);
    await wallet.save();
    
    order.status = "cancelled";
    await order.save();
  }
}else{
  order.status = "cancelled";
  await order.save();
}
  
  
      // await ordermodel.deleteOne({ _id: req.query.orderid });

    res.json({ response: true });
  } catch (error) {
    console.log(error.message);
  }
};

// for order retern 

const orderReturn = async (req, res)=>{
  try {

      const {
          orderId
      } = req.body;

      const order = await ordermodel.findById(orderId).populate("orderitems");
      let wallet = await walletmodel.findOne({user: order.user});
      
      if(!wallet){
          wallet = new walletmodel({
              user: order.user,
              balance: order.price,
              history: [{
                  type: "add",
                  amount: order.totalprice,
                  newBalance: order.totalprice
              }]
          })

          await wallet.save();

          order.status = "cancelled";
          await order.save();

      }else{
          let balance = wallet.balance;
          let newBalance = balance + order.totalprice;
          let history = {
              type: "add",
              amount: order.totalprice,
              newBalance: newBalance
          }

          wallet.balance = newBalance;
          wallet.history.push(history);
          await wallet.save();

          order.status = "cancelled";
          await order.save();
      }

      for(const item of order.orderitems){
          
          await productmodel.updateOne({_id: item.product },
              {
                  $inc: {quantity: item.quantity}
              })
  
      }


      if(wallet){
          res.send({success: true});
      }else{
          res.send({success: false});
      }
      
      
  } catch (error) {
      console.log(error);
  }
}

module.exports = {
  loadcheckout,
  creatorder,
  cancelorder,
  razorpayactive,
  orderReturn
};
