const addressmodel = require("../../model/address/addressmodel");
const cartmodel = require("../../model/cart/cartmodel");
const ordermodel = require("../../model/order/ordermodel");
const orderitemmodel = require("../../model/order-item/orderitemmodel");
const productmodel = require("../../model/product/productmodel");
const { promises } = require("nodemailer/lib/xoauth2");

//for load checkout

const loadcheckout = async (req, res) => {
  try {
    const cart = await cartmodel.findOne({ userid: req.session.session_id });
    const address = await addressmodel.find({ userid: req.session.session_id });
    res.render("./user/checkout", { address, cart });
  } catch (error) {
    console.log(error.message);
  }
};

//for creat order

const creatorder = async (req, res) => {
  try {
    let shippingcharge = 0;
    if (req.body.shippingmethod == "standardShipping") {
      shippingcharge = 80;
    }
    if (req.body.shippingmethod == "expressShipping") {
      shippingcharge = 40;
    }

    const cart = await cartmodel.findOne({ userid: req.session.session_id });

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
      totalprice: cart.cartprice + shippingcharge,
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
    console.log(never);

    await cartmodel.deleteOne({ userid: req.session.session_id });
    res.redirect('/')
    // console.log(order);
  } catch (error) {
    console.log(error.message);
  }
};

//for cancel order

const cancelorder = async (req, res) => {
  try {
    const order = await ordermodel.find({ _id: req.query.orderid });
    const index = order[0].orderitems.indexOf(req.query.itemid);
    
    const thispro = await ordermodel
    .find({ _id: req.query.orderid })
    .populate("orderitems");
    const product = await productmodel.findOne({
        _id: thispro[0].orderitems[index].product,
    });
    await productmodel.updateOne(
        { _id: thispro[0].orderitems[index].product },
        {
            $set: {
                quantity: product.quantity + thispro[0].orderitems[index].quantity,
            },
        }
        );
        order[0].orderitems.splice(index, 1);
        await ordermodel.updateOne(
          { _id: req.query.orderid },
          { $set: { orderitems: order[0].orderitems } }
        );
    const drop = await ordermodel.find({ _id: req.query.orderid });
    if (drop[0].orderitems.length == 0) {
      await ordermodel.deleteOne({ _id: req.query.orderid });
    }

    res.json({ response: true });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadcheckout,
  creatorder,
  cancelorder,
};
