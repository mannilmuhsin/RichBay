const { render } = require("ejs");
const User = require("../../model/user/usermodel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bodyparser = require("body-parser");
const speakeasy = require("speakeasy");
const product = require("../../model/product/productmodel");
const productmodel = require("../../model/product/productmodel");
const addressmodel = require("../../model/address/addressmodel");
const usermodel = require("../../model/user/usermodel");
const orderitemmodel = require("../../model/order-item/orderitemmodel");
const ordermodel = require("../../model/order/ordermodel");
const cartmodel = require("../../model/cart/cartmodel");
const catogerymodel = require("../../model/catogery/catogerymodel");
const banner = require("../../model/banner/banner");

const makeotp = () => {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });
    const token = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });
    return { token, secret };
  } catch (error) {
    res.render("./user/404");
  }
};

const loadsignup = async (req, res) => {
  try {
    if (req.session.session_id) {
      res.redirect("/");
    } else {
      res.render("./user/signup", { message: "" });
    }
  } catch (e) {
    console.log(e.message);
  }
};

const loadlogin = async (req, res) => {
  try {
    if (req.session.session_id) {
      res.redirect("/");
    } else {
      res.render("./user/login", { message: "" });
    }
  } catch (e) {
    console.log(e.message);
  }
};

const loadHome = async (req, res) => {
  try {
    const user = await usermodel.findOne({ _id: req.session.session_id });
    const banners = await banner.find();
    const catogery = await catogerymodel.find({});
    const cart = await cartmodel.find({ userid: req.session.session_id });
    let wishlistcount = 0;
    let cartcount = 0;
    if (cart.length) {
      cartcount = cart[0].items.length;
    }
    if (user) {
      wishlistcount = user.wishlist.length;
    }
    const product = await productmodel.find({ quantity: { $gt: 0 } }).limit(10);
    res.render("./user/home", {
      message: "",
      product,
      session_id: req.session.session_id,
      catogery,
      banners,
      user,
      cartcount,
      wishlistcount,
    });
  } catch (e) {
    console.log(e.message);
  }
};

const sendverifyemail = async (name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "marakadians@gmail.com",
        pass: "mnfpzaetsetikufj",
      },
    });
    let mailoptions;
    if (name == null) {
      mailoptions = {
        from: "mannilmuhsin3@gmail.com",
        to: email,
        subject: "for verification mail",
        html: "<p>your otp is " + user_id + "</p>",
      };
    } else {
      mailoptions = {
        from: "mannilmuhsin3@gmail.com",
        to: email,
        subject: "for verification mail",
        html:
          "<p>hi" +
          name +
          ',please click here to <a href="http://127.0.0.1:3313/verify?id=' +
          user_id +
          '">verify</a>your email </p>',
      };
    }

    transporter.sendMail(mailoptions, (error, data) => {
      if (error) {
        res.render("./user/404");
      } else {
        console.log("Email has been sent ", data.response);
      }
    });
  } catch (error) {
    res.render("./user/404");
  }
};

const createUser = async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const userdata = await User.findOne({ email: email });

    if (userdata) {
      res.render("./user/signup", { message: "this email all redy used" });
    } else {
      if (req.body.password !== req.body.repassword) {
        res.render("./user/signup", { message: "password not matching" });
      } else {
        const hashpass = await bcrypt.hash(password, 10);
        const newuser = new User({
          username: username,
          email: email,
          password: hashpass,
          verifide: false,
          isadmin: false,
        });
        const userdata = await newuser.save();
        //     sendverifyemail(req.body.username,req.body.email,userdata._id)
        //     res.redirect('/witing')
        const token = makeotp();
        console.log(token.secret.base32);
        console.log(token.token);
        req.session.secret = token.secret.base32;
        // req.session.session_id=userdata._id
        req.session.token = userdata._id;
        sendverifyemail(null, email, token.token);
        // res.redirect('/')
        res.redirect("/getotp");
      }
    }
  } catch (e) {
    console.log(e.message);
  }
};

const verifyemail = async (req, res) => {
  try {
    const id = req.query.id;
    const strid = id.toString();

    const user = await User.findOne({ _id: strid });
    if (user) {
      user.verifide = true;

      await user.save();
      res.redirect("/login");
    } else {
      res.redirect("/signup");
    }
  } catch (error) {
    res.render("./user/404");
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userdata = await User.findOne({ email: email });

    if (userdata) {
      const passMatch = await bcrypt.compare(password, userdata.password);

      if (passMatch) {
        if (userdata.verifide == true) {
          if (userdata.access == true) {
            // const token=makeotp()
            // console.log(token.secret.base32);
            // console.log(token.token);
            // req.session.secret=token.secret.base32
            req.session.session_id = userdata._id;
            // sendverifyemail(null,email,token.token)
            res.redirect("/");
            // res.render('./verify/otp')
          } else {
            res.render("./user/login", { message: "this account is blocked" });
          }
        } else {
          res.render("./user/login", { message: "email not verified" });
        }
      } else {
        res.render("./user/login", { message: "password incorrected" });
      }
    } else {
      res.render("./user/login", { message: "incorrect password or email" });
    }
  } catch (e) {
    console.log(e.message);
  }
};

const loadveryfi = async (req, res) => {
  try {
    res.render("./verify/verify");
  } catch (error) {
    res.render("./user/404");
  }
};

const verifyotp = async (req, res) => {
  try {
    const validation = speakeasy.totp.verify({
      secret: req.session.secret,
      encoding: "base32",
      token: req.body.otp,
      window: 0,
    });

    req.session.secret = null;

    console.log(validation);
    if (validation) {
      const user = await User.findOne({ _id: req.session.token });
      if (user) {
        user.verifide = true;

        await user.save();
        req.session.session_id = req.session.token;
        req.session.token = null;
        res.redirect("/login");
      } else {
        req.session.session_id = null;
        res.redirect("/signup");
      }

      // res.redirect('/')
    } else {
      // await usermodel.deleteOne({_id:req.session.session_id})
      // req.session.destroy();
      // req.session.session_id=null
      // res.clearCookie('user_id')
      res.render("./verify/otp", { message: "OTP NOT MACHING try again" });
    }
  } catch (error) {
    res.render("./user/404");
  }
};

//reotp making
const resendotp = async (req, res) => {
  try {
    const token = makeotp();
    console.log(req.session.token);
    console.log(token.token);
    req.session.secret = token.secret.base32;
    // req.session.session_id=userdata._id
    // req.session.token=userdata._id
    const user = await usermodel.findOne({ _id: req.session.token });
    // console.log(user);
    sendverifyemail(null, user.email, token.token);
    res.render("./verify/otp", { message: "OTP NOT MACHING try again" });
  } catch (error) {
    res.render("./user/404");
  }
};

const loadotp = async (req, res) => {
  try {
    res.render("./verify/otp", { message: "" });
  } catch (error) {
    res.render("./user/404");
  }
};

//for load user profile

const loaduserprofile = async (req, res) => {
  try {
    const catogery = await catogerymodel.find({});
    const orderlist = await ordermodel
      .find({ user: req.session.session_id })
      .populate("user", "username")
      .populate({
        path: "orderitems",
        populate: { path: "product", populate: "catogery" },
      })
      .sort({ dateorder: -1 });

    const user = await usermodel.findOne({ _id: req.session.session_id });
    const address = await addressmodel.find({ userid: req.session.session_id });
    const now = new Date();
    res.render("./user/userprofile", {
      user,
      address,
      orderlist,
      catogery,
      now,
    });
  } catch (error) {
    res.render("./user/404");
  }
};

//load addaddress

const loadaddress = async (req, res) => {
  try {
    const catogery = await catogerymodel.find();
    const user = await usermodel.findOne({ _id: req.session.session_id });
    res.render("./user/addaddress", { user, catogery });
  } catch (error) {
    res.render("./user/404");
  }
};
// for creat new address

const addnewaddress = async (req, res) => {
  try {
    const newuseraddress = new addressmodel({
      userid: req.session.session_id,
      name: req.body.fullName,
      mobile: req.body.mobileNumber,
      pin: req.body.pincode,
      locality: req.body.locality,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
    });

    const useraddress = await newuseraddress.save();
    res.redirect("/userprofile");
  } catch (error) {
    res.render("./user/404");
  }
};
//for load edit adreess

const loadeditaddress = async (req, res) => {
  try {
    const catogery = await catogerymodel.find();
    const user = await usermodel.findOne({ _id: req.session.session_id });
    const address = await addressmodel.findOne({ _id: req.query.id });
    res.render("./user/editaddress", { address, user, catogery });
  } catch (error) {
    res.render("./user/404");
  }
};

//.for edit address

const editaddress = async (req, res) => {
  try {
    await addressmodel.updateMany(
      { _id: req.query.id },
      {
        $set: {
          name: req.body.fullName,
          mobile: req.body.mobileNumber,
          pin: req.body.pincode,
          locality: req.body.locality,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
        },
      }
    );
    res.redirect("/userprofile");
  } catch (error) {
    res.render("./user/404");
  }
};
// for load edit profile

const loadeditprofile = async (req, res) => {
  try {
    const catogery = await catogerymodel.find();
    const user = await User.findOne({ _id: req.session.session_id });
    res.render("./user/editprofile", { user, catogery });
  } catch (error) {
    res.render("./user/404");
  }
};
//for edite profile

const editprofile = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.query.id },
      {
        $set: {
          username: req.body.username,
        },
      }
    );
    res.redirect("/userprofile");
  } catch (error) {
    res.render("./user/404");
  }
};
//for change password

const loadchangpassword = async (req, res) => {
  try {
    const catogery = await catogerymodel.find();
    const user = await usermodel.findOne({ _id: req.session.session_id });
    res.render("./user/changepassword", { message: "", user, catogery });
  } catch (error) {
    res.render("./user/404");
  }
};
// for chagepasseord

const change_password = async (req, res) => {
  try {
    const oldpassword = await User.findOne({ _id: req.session.session_id });

    const passMatch = await bcrypt.compare(
      req.body.currentPassword,
      oldpassword.password
    );
    if (passMatch) {
      if (req.body.newPassword == req.body.confirmPassword) {
        const hashpass = await bcrypt.hash(req.body.newPassword, 10);

        await User.updateOne(
          { _id: oldpassword._id },
          {
            $set: {
              password: hashpass,
            },
          }
        );
        res.redirect("/userprofile");
      } else {
        res.render("./user/changepassword", {
          message: "Conform Password Is Not Maching ",
        });
      }
    } else {
      res.render("./user/changepassword", {
        message: "Incorruct Current Password  ",
      });
    }
  } catch (error) {
    res.render("./user/404");
  }
};

// user logout

const logout = async (req, res) => {
  try {
    req.session.session_id = null;
    res.redirect("/");
  } catch (error) {
    res.render("./user/404");
  }
};

//for display catogety

const displaycatogery = async (req, res) => {
  try {
    const catogery = await catogerymodel.find({});
    const product = await productmodel.find({
      catogery: req.query.id,
      quantity: { $gt: 0 },
    });
    res.render("./catogery/catogery-user-viwe", {
      product,
      session_id: req.session.session_id,
      catogery,
    });
  } catch (error) {
    res.render("./user/404");
  }
};

//for display full product

const displayfullproduct = async (req, res) => {
  try {
      let products = await productmodel.find({ quantity: { $gt: 0 } });
      
      // Function to search for products based on given criteria
      function findProducts(query) {
          const { categoryId, searchContent } =
          query;
          let results = products;
          
          if (categoryId !== undefined) {
              results = results.filter(
                  (product) => product.catogery.toString() === categoryId
                  );
                }
                
                if (searchContent !== undefined) {
                    const searchRegExp = new RegExp(searchContent, "i");
                    results = results.filter(
                        (product) =>
                        product.productname.match(searchRegExp) ||
                        product.description.match(searchRegExp) ||
                        product.color.match(searchRegExp) ||
                        product.brand.match(searchRegExp)
                        );
                    }

                    return results;
                }
                let query = req.query;
                
                const product = findProducts(query);
                // const countproduct = product.length
                
                
                
                const totalProducts = product.length;
                const items_per_page=5;
                const page = +req.query.page || 1;
                const lastPage = Math.ceil(totalProducts / items_per_page);
    const hasPrevPage = page > 1;
    const hasNextPage = page < lastPage;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const startIdx = (page - 1) * items_per_page;
    const paginatedProducts = product.slice(startIdx, startIdx + items_per_page);

    const catogery = await catogerymodel.find({});
    const user = await usermodel.findOne({ _id: req.session.session_id });
    res.render("./catogery/full-products", {
         product : paginatedProducts,
         catogery,
          user,
          hasPrevPage,
          prevPage,
          lastPage,
          currentPage: page,
          hasNextPage,
          nextPage
         });
  } catch (error) {
    res.render("./user/404");
  }
};

const displayfullproductinpost = async (req, res) => {
  try {
    const products = await productmodel.find({ quantity: { $gt: 0 } });

    // Function to search for products based on given criteria
    function findProducts(query) {
      const {
        categoryId,
        brandId,
        color,
        sortOption,
        priceOptions,
        searchContent,
      } = query;
      if (priceOptions.length !== 0) {
        var minPrice = priceOptions[0].split("-")[0];
        var maxPrice = priceOptions[priceOptions.length - 1].split("-")[1];
      } else {
        const minPrice = undefined;
        const maxPrice = undefined;
      }
      let results = products;

      if (categoryId !== undefined) {
        if (categoryId !== "*") {
          results = results.filter(
            (product) => product.catogery.toString() === categoryId
          );
        }
      }

      // if (brandId !== undefined) {
      //   results = results.filter((product) => product.brandId === brandId);
      // }

      // if (color !== undefined) {
      //   results = results.filter((product) => product.color === color);
      // }

      if (minPrice !== undefined) {
        results = results.filter((product) => product.price >= minPrice);
      }

      if (maxPrice !== undefined) {
        results = results.filter((product) => product.price <= maxPrice);
      }
      if (sortOption !== undefined) {
        if (sortOption === "price-low-high") {
          results.sort((a, b) => a.price - b.price);
        } else if (sortOption === "price-high-low") {
          results.sort((a, b) => b.price - a.price);
        }
      }

      if (searchContent !== undefined) {
        const searchRegExp = new RegExp(searchContent, "i");
        results = results.filter(
          (product) =>
            product.productname.match(searchRegExp) ||
            product.description.match(searchRegExp) ||
            product.color.match(searchRegExp) ||
            product.brand.match(searchRegExp)
        );
      }

      return results;
    }
    let query = req.body;

    const product = findProducts(query);
    const catogery = await catogerymodel.find({});
    const user = await usermodel.findOne({_id: req.session.session_id})

    res.json({
      success: true,
      product: product,
      user:user
    });
    // res.render('./catogery/full-products',{product,session_id:req.session.session_id,catogery})
  } catch (error) {
    res.render("./user/404");
  }
};

// for list search product

const list_search_product = async (req, res) => {
  try {
    const product = await productmodel.find({
      $or: [
        {
          productname: { $regex: ".*" + req.body.search + ".*", $options: "i" },
        },
        // {catogery:{$regex:'.*'+req.query.search+'.*',$options:'i'}},
        // {price:{$regex:'.*'+req.body.search+'.*'}}
      ],
    });
    const catogery = await catogerymodel.find({});
    res.render("./catogery/search-product", {
      product,
      session_id: req.session.session_id,
      catogery,
    });
  } catch (error) {
    res.render("./user/404");
  }
};

// for load success page

const loadsuccess = async (req, res) => {
  try {
    const coupen = req.query.coupen;
    const order = await ordermodel
      .findOne({ _id: req.query.id })
      .populate("user", "username")
      .populate("shippingaddress")
      .populate({
        path: "orderitems",
        populate: { path: "product", populate: "catogery" },
      });

    let shippingcharge = 0;
    // if (order.shippingmethod == "standardShipping") {
    //   shippingcharge = 80;
    // }
    if (order.shippingmethod == "expressShipping") {
      shippingcharge = 40;
    }
    const catogery = await catogerymodel.find();
    const user = await usermodel.findOne({ _id: req.session.session_id });

    res.render("./user/success", {
      order,
      shippingcharge,
      coupen,
      user,
      catogery,
    });
  } catch (error) {
    res.render("./user/404");
  }
};
//for wish list

const wishlisthandle = async (req, res) => {
  try {
    var user = await usermodel.findOne({ _id: req.session.session_id });
    const allredyadded = user.wishlist.find(
      (id) => id.toString() === req.query.prodid
    );
    if (allredyadded) {
      await User.findByIdAndUpdate(
        req.session.session_id,
        {
          $pull: { wishlist: req.query.prodid },
        },
        { new: true }
      );
      user = await usermodel.findOne({ _id: req.session.session_id });
      res.json({ response: false, user });
    } else {
      await User.findByIdAndUpdate(
        req.session.session_id,
        {
          $push: { wishlist: req.query.prodid },
        },
        { new: true }
      );
      user = await usermodel.findOne({ _id: req.session.session_id });
      res.json({ response: true, user });
    }
  } catch (error) {
    res.render("./user/404");
  }
};

// for load wish list

const load_wish_list = async (req, res) => {
  try {
    const user = await usermodel.findOne({ _id: req.session.session_id });
    const product = await productmodel.find({ _id: { $in: user.wishlist } });
    const catogery = await catogerymodel.find();

    res.render("./catogery/wishlist", { product, user, catogery });
  } catch (error) {
    res.render("./user/404");
  }
};
//for load user order list

const load_orderlist = async (req, res) => {
  try {
    const thisorder = await ordermodel
      .find({ _id: req.query.id })
      .populate("user", "username")
      .populate("shippingaddress")
      .populate({
        path: "orderitems",
        populate: { path: "product", populate: "catogery" },
      });
    const order = thisorder[0];

    const catogery = await catogerymodel.find();
    const user = await usermodel.findOne({ _id: req.session.session_id });
    res.render("./user/orderdetailes-user", { order, user, catogery });
  } catch (error) {
    res.render("./user/404");
  }
};

module.exports = {
  loadsignup,
  loadlogin,
  loadHome,
  createUser,
  verifyLogin,
  verifyemail,
  loadveryfi,
  verifyotp,
  loadotp,
  list_search_product,
  wishlisthandle,
  load_wish_list,

  loaduserprofile,
  loadaddress,
  addnewaddress,
  loadeditaddress,
  editaddress,
  loadeditprofile,
  editprofile,
  loadchangpassword,
  change_password,
  logout,
  resendotp,
  displaycatogery,
  displayfullproduct,
  loadsuccess,
  load_orderlist,
  displayfullproductinpost,
};
