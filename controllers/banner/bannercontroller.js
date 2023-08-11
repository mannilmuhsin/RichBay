const bannerModel = require('../../model/banner/banner');
const categoryModel = require('../../model/catogery/catogerymodel');
const cloudinaryUpload = require('../../controllers/catogery/catogerycontroler');
const cloudinary=require('cloudinary').v2


cloudinary.config({ 
    cloud_name: 'dswtrdxzw', 
    api_key: '928468198542362', 
    api_secret: 'YKxn9-7Mu2olsWKdfDF54IJJC2U' 
  });


const loadBanner = async (req, res)=>{
    try {
        const banners = await bannerModel.find().populate("targetCategory");
        const total=banners.length
        res.render('./admin/banner',{banners,total});
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddBanner = async (req, res)=>{
    const categories = await categoryModel.find();
    res.render('admin/addBanner',{categories});
}

const addBanner = async (req, res)=>{
    try {

        const {
            title,
            targetCategory,
            description,

        } = req.body;

        const { image } = req.files;
        const bannerImagedetails = await uploadimageforbanner(image)
        const bannerImage={
            public_id:bannerImagedetails.public_id,
            url:bannerImagedetails.url
        }

        const newBanner = new bannerModel({
            title,
            bannerImage,
            description,
            targetCategory,
        })

        newBanner.save();
        res.redirect('/admin/banner');

    } catch (error) {
        console.log(error);
    }
}

const uploadimageforbanner=async(onefile)=>{
    try {
       
        const result=await cloudinary.uploader.upload(onefile.tempFilePath,{
            public_id:`${Date.now()}`,
            resource_type:'auto',
            folder:'images',
              transformation: [
                { height: 600, crop: "scale", quality: 100}
            ]
        })
        return result

    } catch (error) {
        console.log(error.message);
    }
  }


module.exports = {
    loadBanner,
    loadAddBanner,
    addBanner,
}