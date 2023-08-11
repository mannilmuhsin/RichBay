const cartModel = require("../../model/cart/cartmodel");
const coupenmodel = require("../../model/coupen/coupenmodel");
const couponModel = require("../../model/coupen/coupenmodel");
const slugify = require("slugify");

const loadCoupon = async (req, res) => {
  try {
    const coupons = await couponModel.find();
    const count = await couponModel.countDocuments();
    res.render("./admin/coupon", { coupons, count });
  } catch (error) {
    throw new Error(error);
  }
};

const loadAddCoupon = (req, res) => {
  try {
    res.render("./admin/addCoupon");
  } catch (error) {
    throw new Error(error);
  }
};

const addCoupon = async (req, res) => {
  try {
    const { discount, expiryDate, minimumAmount, maximumAmount } = req.body;

    let name = req.body.name.toUpperCase();

    const couponExist = await couponModel.findOne({ couponName: name });

    if (couponExist) {
      res.json({ response: false });
    } else {
      const slug = slugify(name);
      const newCoupon = new couponModel({
        couponName: name,
        discount: discount,
        expiryDate: expiryDate,
        minAmount: minimumAmount,
        maxAmount: maximumAmount,
        slug: slug,
      });

      await newCoupon.save();
      res.json({ response: true });
    }
  } catch (error) {
    throw new Error(error);
  }
};

const loadEditCoupon = async (req, res) => {
  try {
    const { id } = req.query;

    const coupon = await couponModel.findOne({ _id: id });

    const expDate = coupon.expiryDate.toISOString().substring(0, 10);

    res.render("./admin/editCoupon", { coupon, expDate });
  } catch (error) {
    throw new Error(error);
  }
};

const editCoupon = async (req, res) => {
  try {
    const { id, discount, expiryDate, minimumAmount, maximumAmount } = req.body;

    await couponModel.findByIdAndUpdate(id, {
      discount: discount,
      expiryDate: expiryDate,
      minAmount: minimumAmount,
      maxAmount: maximumAmount,
    });
    res.json({ response: true });
  } catch (error) {
    throw new Error(error);
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { couponName, addressId, cartPrice } = req.body;

    const coupon = await couponModel.findOne({ couponName });

    if (coupon) {
      if (cartPrice >= coupon.minAmount) {
        // const address = await addressModel.findOne({_id: addressId})
        // const cart = await cartModel.findOne({userId: address.user});
        // let productList = [];
        // const product = await cartModel
        //                         .findOne({userId: address.user})
        //                         .populate("items.productId");

        // product.items.forEach((item)=>{
        //     productList.push(item.productId)
        // })

        res.json({ response: true, coupon: coupon });
      } else {
        res.json({ response: "min" });
      }
    } else {
      res.json({ response: false });
    }
  } catch (error) {
    throw new Error(error);
  }
};

// for valid operator

const isvalid = async (req, res) => {
  try {
    const coupen = await coupenmodel.findOne({ slug: req.query.slug });
    if (coupen.valid == true) {
      await coupenmodel.updateOne(
        { slug: req.query.slug },
        { $set: { valid: false } }
      );
    } else {
      await coupenmodel.updateOne(
        { slug: req.query.slug },
        { $set: { valid: true } }
      );
    }
    res.json({ response: { success: true } });
  } catch (error) {
    res.render("./user/404");
  }
};

module.exports = {
  loadAddCoupon,
  addCoupon,
  loadCoupon,
  loadEditCoupon,
  editCoupon,
  applyCoupon,
  isvalid,
};
