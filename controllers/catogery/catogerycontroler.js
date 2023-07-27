
const catogerymodel = require('../../model/catogery/catogerymodel');
const catogery=require('../../model/catogery/catogerymodel');
const productmodel = require('../../model/product/productmodel');
const product=require('../../model/product/productmodel');
const { findOne } = require('../../model/user/usermodel');
const slugify=require('slugify')
const cloudinary=require('cloudinary').v2


cloudinary.config({ 
    cloud_name: 'dswtrdxzw', 
    api_key: '928468198542362', 
    api_secret: 'YKxn9-7Mu2olsWKdfDF54IJJC2U' 
  });


//function for multiple image

  const multipleimage=async (file)=>{
    try {
        let imageurllist=[]
        for(let i=0;i<file.length;i++){
            let onefile=file[i]
            const result=await uploadimage(onefile)
            imageurllist.push(result)
        }
        return imageurllist
        
    } catch (error) {
        console.log(error.message);
    }
  }

//upload imag to cloudinarry

  const uploadimage=async(onefile)=>{
    try {
        const result=await cloudinary.uploader.upload(onefile.tempFilePath,{
            public_id:`${Date.now()}`,
            resource_type:'auto',
            folder:'images'
        })
        return result.url

    } catch (error) {
        console.log(error.message);
    }
  }

  //for create product

const creareproduct=async(req,res)=>{
    try {
        
        const file=req.files.image
        const urllist= await multipleimage(file)
        const slug=slugify(req.body.productName)
       
            
// console.log(urllist)

        const newproduct=await new product({
            productname:req.body.productName,
            catogery:req.body.category,
            price:req.body.price,
            quantity:req.body.quantity,
            description:req.body.description,
            image:urllist,
            slug:slug
        })
    if(urllist[0]){
        const paroduct=await newproduct.save()
    }
        
        res.redirect('/admin/productlist')
    } catch (error) {
        console.log(error.message);
    }
}


//load catogery

const loadcatogery=async(req,res)=>{
    try {

        let search=''
        if(req.body.search){
            search=req.body.search
        }

        const catogery=await catogerymodel.find({
            $or:[
                {catogeryname:new RegExp(search,'i')}
            ]
        })
        // console.log(catogery);
        const catocount=await catogerymodel.find().count()
        res.render('./catogery/catogerylist',{catogery,catocount})
    } catch (error) {
        console.log(error.message);
    }
}


//load add cactogery


const loadaddcatogery=async(req,res)=>{
    try {

       
        res.render('./catogery/addcatogery',{message:'',action:'/catogerylist/addcatogery'})
    } catch (error) {
        console.log(error.message);
    }
}

//creat catogery

const createcatogery=async(req,res)=>{
    try {
        const existcatogery=await catogery.findOne({
                catogeryname:new RegExp(req.body.catogery,'i')        
            
            })

        if(existcatogery){
            res.render('./catogery/addcatogery',{message:'This catogery allredy exist !',action:'/catogerylist/addcatogery'})
        }else{
            const newcatogery=new catogery({
                catogeryname:req.body.catogery
            })

            await newcatogery.save()

            res.redirect('/admin/catogerylist')
        
        }
    } catch (error) {
        console.log(error.message);
    }
}


//for load catogery edit

const loadedite=async(req,res)=>{
    try {
        const catogery=await catogerymodel.findOne({_id:req.query.id})
        res.render('./catogery/editcatogery',{message:'',catogery})
    } catch (error) {
    console.log(error.message);
    }
}


//edit catogery


const updatecatogery=async(req,res)=>{
    try {
        
 await catogery.updateOne({_id:req.query.id},{$set:{catogeryname:req.body.catogery}})
 res.redirect('/admin/catogerylist')

    } catch (error) {
        console.log(error.message);
    }
}


//load product list

const loadproductlist=async (req,res)=>{
    try {
        const product=await productmodel.find({})
        res.render('./catogery/productlist',{product})
    } catch (error) {
        console.log(error.message);
    }
}


//for load edit product

const loadeditproduct=async(req,res)=>{
    try {
        const idproduct=await product.findOne({_id:req.query.id})
        const category=await catogerymodel.find({})
        res.render('./catogery/editproduct',{category,idproduct})
    } catch (error) {
        console.log(error.message);
    }
}

//for load add product

const loadaddproduct=async(req,res)=>{
    try {
        
        const category=await catogerymodel.find({})
        res.render('./catogery/addproduct',{category})
    } catch (error) {
        console.log(error.message);
    }
}


//for edit product

const editproduct=async(req,res)=>{
    try {
        await productmodel.updateMany({_id:req.query.id},{$set:{
            productname:req.body.productName,
            catogery:req.body.category,
            price:req.body.price,
            quantity:req.body.quantity,
            description:req.body.description
        }})
res.redirect('/admin/productlist')

    } catch (error) {
        console.log(error.message);
    }
}

//delete product

const deleteproduct=async(req,res)=>{
    try {
        await product.deleteOne({_id:req.query.id})
        res.json({response: true})
    } catch (error) {
        console.log(error.message);
    }
}

//load product detiles

const loadproductdetiles=async (req,res)=>{
    try {

        const thisproduct=await productmodel.findOne({_id:req.query.id})
      
        
        res.render('./catogery/productdetiles',{thisproduct,session_id:req.session.session_id,product})
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
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
    loadproductdetiles
}