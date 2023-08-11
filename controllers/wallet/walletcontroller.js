const cartModel = require("../../model/cart/cartmodel");
const catogerymodel = require("../../model/catogery/catogerymodel");
const userModel = require("../../model/user/usermodel");
const walletModel = require("../../model/wallet/walletmodel");

const loadWallet = async (req, res) => {
  try {
    const userId = req.session.session_id;

    const user = await userModel.findById(userId);
    const wallet = await walletModel.findOne({ user: userId });
    const cart = await cartModel.findOne({ userId: userId });
    const catogery = await catogerymodel.find();
    res.render("user/wallet", { id: userId, user, wallet, cart, catogery });
  } catch (error) {
    res.render("./user/404");
  }
};

module.exports = {
  loadWallet,
};
