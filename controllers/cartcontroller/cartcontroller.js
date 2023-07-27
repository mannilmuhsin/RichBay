const cartmodel = require("../../model/cart/cartmodel");
const productmodel = require("../../model/product/productmodel");

const loadcart = async (req, res) => {
  try {
    const cart = await cartmodel.findOne({ userid: req.session.session_id });
    if(cart){
      const items =Promise.all( cart.items.map(async (item) => {
        // console.log(item);
        const product = await productmodel.findOne({ _id: item.productid });
        if (item.quantity > product.quantity) {
         const suosu= await cartmodel.updateMany(
            {
              userid: req.session.session_id ,
              "items.productid": item.productid,
            },
            { $set: { "items.$.quantity": product.quantity ,"items.$.totalprice": item.productprice* product.quantity} }
          );
          const totalcartprice = await cartmodel.aggregate([
            {
              $match: { userid: req.session.session_id },
            },
            {
              $unwind: "$items",
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$items.totalprice" },
              },
            },
          ]);
          const totalcartpricelast = totalcartprice[0].total;
      
          await cartmodel.updateOne(
            { userid: req.session.session_id },
            { $set: { cartprice: totalcartpricelast } }
          );
          console.log(suosu);
        }
    
      }));
      

   }
    res.render("./catogery/cart", { cart });
  } catch (error) {
    console.log(error.message);
  }
};

const addtocart = async (req, res) => {
  try {
    const product = await productmodel.findOne({ _id: req.query.id });
    const existcart = await cartmodel.findOne({
      userid: req.session.session_id
    });
    if (existcart) {
      const existproduct = await cartmodel.findOne({
        items: { $elemMatch: { productid: req.query.id } },
      });

      if (existproduct) {
        const item = existproduct.items.find(
          (item) => item.productid == req.query.id
        );

        if (item.quantity < product.quantity) {
          if (req.query.action == "plus") {
            await cartmodel.findOneAndUpdate(
              {
                userid: req.session.session_id,
                "items.productid": product._id,
              },
              {
                $inc: {
                  "items.$.quantity": 1,
                  "items.$.totalprice": product.price,
                },
              },
              {
                new: true,
              }
            );
          }
        }else{
          res.json({ response: false });
        }

        if (item.quantity > 1) {
          if (req.query.action == "mainus") {
            await cartmodel.findOneAndUpdate(
              {
                userid: req.session.session_id,
                "items.productid": product._id,
              },
              {
                $inc: {
                  "items.$.quantity": -1,
                  "items.$.totalprice": -product.price,
                },
              },
              {
                new: true,
              }
            );
          }
          
        }
      } else {
        const item = {
          productid: product._id,
          quantity: 1,
          totalprice: product.price,
          productname: product.productname,
          productprice: product.price,
          productimage: product.image[0],
        };

        await cartmodel.updateOne(
          { userid: req.session.session_id },
          { $push: { items: item } }
        );
      }
    } else {
      const newitem = new cartmodel({
        userid: req.session.session_id,
        items: [
          {
            productid: product._id,
            quantity: 1,
            totalprice: product.price,
            productname: product.productname,
            productprice: product.price,
            productimage: product.image[0],
          },
        ],
        cartprice: product.price,
      });

      await newitem.save();
    }

    const totalcartprice = await cartmodel.aggregate([
      {
        $match: { userid: req.session.session_id },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$items.totalprice" },
        },
      },
    ]);
    const totalcartpricelast = totalcartprice[0].total;

    await cartmodel.updateOne(
      { userid: req.session.session_id },
      { $set: { cartprice: totalcartpricelast } }
    );

   res.json({ response: true });
  } catch (error) {
    console.log(error.message);
  }
};

//for remove from cart

const removeonefromcart = async (req, res) => {
  try {
    await cartmodel.updateOne(
      { userid: req.session.session_id },
      { $pull: { items: { productid: req.query.id } } }
    );

    const existcart = await cartmodel.findOne({
      userid: req.session.session_id,
    });
    if (existcart.items.length >= 1) {
      const totalcartprice = await cartmodel.aggregate([
        {
          $match: { userid: req.session.session_id },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$items.totalprice" },
          },
        },
      ]);
      const totalcartpricelast = totalcartprice[0].total;

      await cartmodel.updateOne(
        { userid: req.session.session_id },
        { $set: { cartprice: totalcartpricelast } }
      );

      res.redirect("/cart");
    } else {
      await cartmodel.deleteOne({ userid: req.session.session_id });
      res.redirect("/cart");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//

module.exports = {
  loadcart,
  addtocart,
  removeonefromcart,
};
