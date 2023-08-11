const catogerymodel = require("../../model/catogery/catogerymodel");
const catogery = require("../../model/catogery/catogerymodel");
const productmodel = require("../../model/product/productmodel");
const product = require("../../model/product/productmodel");
const usermodel = require("../../model/user/usermodel");
const { findOne } = require("../../model/user/usermodel");
const slugify = require("slugify");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dswtrdxzw",
  api_key: "928468198542362",
  api_secret: "YKxn9-7Mu2olsWKdfDF54IJJC2U",
});

//function for multiple image

const multipleimage = async (file) => {
  try {
    let imageurllist = [];
    for (let i = 0; i < file.length; i++) {
      let onefile = file[i];
      const result = await uploadimage(onefile);
      imageurllist.push(result);
    }
    return imageurllist;
  } catch (error) {
    res.render("./user/404");
  }
};

// const cloudinaryuploadimg=async (fileuploads)=>{
//   return new Promise((resolve)=>{
//       cloudinary.uploader.upload(fileuploads,(result)=>{
//           resolve(
//               {
//                   url:result.secure_url,
//               },
//               {
//                   resource_type:"auto"
//               }
//           )
//       })
//   })
// }
//upload imag to cloudinarry

const uploadimage = async (onefile) => {
  try {
    const result = await cloudinary.uploader.upload(onefile.tempFilePath, {
      public_id: `${Date.now()}`,
      resource_type: "auto",
      folder: "images",
      transformation: [
        {
          width: 300,
          height: 350,
          crop: "fill_pad",
          gravity: "auto",
          quality: 100,
        },
      ],
    });
    let image = {
      url: result.url,
      public_id: result.public_id,
    };
    return image;
  } catch (error) {
    res.render("./user/404");
  }
};

//for create product

const creareproduct = async (req, res) => {
  try {
    const file = req.files.image;
    const urllist = await multipleimage(file);
    const slug = slugify(req.body.productName);

    // console.log(urllist)
    const oneproduct = await productmodel.findOne({
      productname: req.body.productName,
    });
    if (oneproduct) {
      const category = await catogerymodel.find();
      res.render("./catogery/addproduct", {
        category,
        message: "This name already exixted ..!",
      });
    } else {
      const newproduct = await new product({
        productname: req.body.productName,
        catogery: req.body.category,
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description,
        image: urllist,
        slug: slug,
        brand: req.body.Brand,
        color: req.body.colur,
      });
      if (urllist[0]) {
        const paroduct = await newproduct.save();
      }

      res.redirect("/admin/productlist");
    }
  } catch (error) {
    res.render("./user/404");
  }
};

//load catogery

const loadcatogery = async (req, res) => {
  try {
    let search = "";
    if (req.body.search) {
      search = req.body.search;
    }

    const catogery = await catogerymodel.find({
      $or: [{ catogeryname: new RegExp(search, "i") }],
    });
    // console.log(catogery);
    const catocount = await catogerymodel.find().count();
    res.render("./catogery/catogerylist", { catogery, catocount });
  } catch (error) {
    res.render("./user/404");
  }
};

//load add cactogery

const loadaddcatogery = async (req, res) => {
  try {
    res.render("./catogery/addcatogery", {
      message: "",
      action: "/catogerylist/addcatogery",
    });
  } catch (error) {
    res.render("./user/404");
  }
};

//creat catogery

const createcatogery = async (req, res) => {
  try {
    const catergoryData = await catogerymodel.findOne({
      catogeryname: { $regex: new RegExp(`^${req.body.catogery}$`, "i") },
    });

    if (catergoryData) {
      res.render("./catogery/addcatogery", {
        message: "This catogery allredy exist !",
        action: "/catogerylist/addcatogery",
      });
    } else {
      const newcatogery = new catogery({
        catogeryname: req.body.catogery.toUpperCase(),
      });

      await newcatogery.save();

      res.redirect("/admin/catogerylist");
    }
  } catch (error) {
    res.render("./user/404");
  }
};

//for load catogery edit

const loadedite = async (req, res) => {
  try {
    const catogery = await catogerymodel.findOne({ _id: req.query.id });
    res.render("./catogery/editcatogery", { message: "", catogery });
  } catch (error) {
    res.render("./user/404");
  }
};

//edit catogery

const updatecatogery = async (req, res) => {
  try {
    await catogery.updateOne(
      { _id: req.query.id },
      { $set: { catogeryname: req.body.catogery } }
    );
    res.redirect("/admin/catogerylist");
  } catch (error) {
    res.render("./user/404");
  }
};

//load product list

const loadproductlist = async (req, res) => {
  try {
    const product = await productmodel.find({});
    res.render("./catogery/productlist", { product });
  } catch (error) {
    res.render("./user/404");
  }
};

//for load edit product

const loadeditproduct = async (req, res) => {
  try {
    const idproduct = await product.findOne({ _id: req.query.id });
    const category = await catogerymodel.find({});
    res.render("./catogery/editproduct", { category, idproduct });
  } catch (error) {
    res.render("./user/404");
  }
};

//for load edit product

const loadeditproductimage = async (req, res) => {
  try {
    const idproduct = await product.findOne({ _id: req.query.id });
    console.log(idproduct);
    res.render("./catogery/editimages", { product: idproduct });
  } catch (error) {
    res.render("./user/404");
  }
};

//for load add product

const loadaddproduct = async (req, res) => {
  try {
    const category = await catogerymodel.find({});
    res.render("./catogery/addproduct", { category, message: "" });
  } catch (error) {
    res.render("./user/404");
  }
};

//for edit product

const editproduct = async (req, res) => {
  try {
    await productmodel.updateMany(
      { _id: req.query.id },
      {
        $set: {
          productname: req.body.productName,
          catogery: req.body.category,
          price: req.body.price,
          quantity: req.body.quantity,
          description: req.body.description,
        },
      }
    );
    const pro = await productmodel.findOne({ _id: req.query.id });
    console.log(pro);

    res.redirect("/admin/productlist");
  } catch (error) {
    res.render("./user/404");
  }
};

//delete product

const deleteproduct = async (req, res) => {
  try {
    await product.deleteOne({ _id: req.query.id });
    res.json({ response: true });
  } catch (error) {
    res.render("./user/404");
  }
};

//load product detiles

const loadproductdetiles = async (req, res) => {
  try {
    const thisproduct = await productmodel.findOne({ slug: req.query.slug });
    const catogery = await catogerymodel.find();
    const user = await usermodel.findOne({ _id: req.session.session_id });
    if (!thisproduct) {
      throw error(e);
    }

    res.render("./catogery/productdetiles", {
      thisproduct,
      product,
      user,
      catogery,
    });
  } catch (error) {
    res.render("./user/404");
  }
};

//for delet image from cloudinary
const deleteImage = async (public_id) => {
  await cloudinary.uploader
    .destroy(public_id)
    .then(() => {
      return true;
    })
    .catch((error) => {
      return false;
    });
};

// for delet image

const deleteProductImage = async (req, res) => {
  const { public_id, productId } = req.query;

  await deleteImage(public_id);

  await productmodel.updateOne(
    { _id: productId, "image.public_id": public_id },
    {
      $pull: {
        image: { public_id: public_id },
      },
    }
  );

  res.json({ response: true });
};

module.exports = {
  loadcatogery,
  loadaddcatogery,
  createcatogery,
  loadedite,
  updatecatogery,
  creareproduct,
  loadproductlist,
  loadeditproduct,
  loadaddproduct,
  editproduct,
  deleteproduct,
  loadproductdetiles,
  uploadimage,
  loadeditproductimage,
  deleteProductImage,
};
