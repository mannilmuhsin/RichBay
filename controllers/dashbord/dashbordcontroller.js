const categoryModel = require("../../model/catogery/catogerymodel");
const orderModel = require("../../model/order/ordermodel");
const userModel = require("../../model/user/usermodel");

const loadDashboard = async (req, res) => {
  try {
    let filterValue = 30;
    if (req.query.filter1) {
      filterValue = parseInt(req.query.filter1);
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - filterValue);

    const daily = await orderModel.aggregate([
      {
        $match: {
          dateorder: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$dateorder",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    console.log(daily);

    const user = await userModel.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const category = await orderModel.aggregate([
      // {
      //     $unwind: "$items"
      // },
      {
        $lookup: {
          from: "orderitems",
          localField: "orderitems",
          foreignField: "_id",
          as: "orderdata",
        },
      },
      {
        $unwind: "$orderdata",
      },
      {
        $lookup: {
          from: "paroducts",
          localField: "orderdata.product",
          foreignField: "_id",
          as: "productdata",
        },
      },
      {
        $unwind: "$productdata",
      },
      {
        $group: {
          _id: "$productdata.catogery",
          count: { $sum: 1 },
        },
      },
    ]);

    let cat = [];
    for (id of category) {
      let val = JSON.parse(
        JSON.stringify(
          await categoryModel.findById(id._id, { catogeryname: 1 })
        )
      );

      val.count = id.count;
      cat.push(val);
    }

    const orders = await orderModel
      .find()
      .populate("user")
      .sort({ dateorder: -1 })
      .limit(5);

    const orderCount = await orderModel.countDocuments();
    const userCount = await userModel.countDocuments();

    res.render("./admin/admindashbord", {
      daily,
      category: cat,
      orderCount,
      userCount,
      user,
      orders,
    });
  } catch (error) {
    res.render("./user/404");
  }
};

const adminLogout = (req, res) => {
  try {
    req.session.admin_id = null;
    res.redirect("/login");
  } catch (error) {
    res.render("./user/404");
  }
};

const loadSalesReport = async (req, res) => {
  try {
    const yearly = await orderModel.aggregate([
      {
        $match: { status: { $eq: "Deliverd" } },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "orderitems",
          foreignField: "_id",
          as: "orderdata",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateorder" },
          },
          items: { $sum: { $sum: "$orderdata.quantity" } },
          count: { $sum: 1 },
          total: { $sum: "$totalprice" },
        },
      },
    ]);

    res.render("./admin/salsereport", { yearly });
  } catch (error) {
    res.render("./user/404");
  }
};

//monthly
const monthlySaleReport = async (req, res) => {
  try {
    const sales = await orderModel.aggregate([
      {
        $match: { status: { $eq: "Deliverd" } },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "orderitems",
          foreignField: "_id",
          as: "orderdata",
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$dateorder" },
          },
          items: { $sum: { $sum: "$orderdata.quantity" } },
          count: { $sum: 1 },
          total: { $sum: "$totalprice" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthlySales = sales.map((sale) => {
      let oneSale = { ...sale };
      oneSale._id.month = months[oneSale._id.month - 1];
      return oneSale;
    });

    console.log(monthlySales);
    res.json({ monthlySales, error: false });
  } catch (error) {
    res.render("./user/404");
  }
};

const dailySalesReport = async (req, res) => {
  try {
    const dailySales = await orderModel.aggregate([
      {
        $match: { status: { $eq: "Deliverd" } },
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "orderitems",
          foreignField: "_id",
          as: "orderdata",
        },
      },
      {
        $group: {
          _id: {
            Year: { $year: "$dateorder" },
            Month: { $month: "$dateorder" },
            Day: { $dayOfMonth: "$dateorder" },
          },
          items: { $sum: { $sum: "$orderdata.quantity" } },
          count: { $sum: 1 },
          total: { $sum: "$totalprice" },
        },
      },
      {
        $sort: { "_id.Year": -1, "_id.Month": 1, "_id.Day": 1 },
      },
    ]);

    res.json({ dailySales, error: false });
  } catch (error) {
    res.render("./user/404");
  }
};
module.exports = {
  loadDashboard,
  adminLogout,
  monthlySaleReport,
  loadSalesReport,
  dailySalesReport,
};
