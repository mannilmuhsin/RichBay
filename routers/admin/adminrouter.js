const { render } = require('ejs')
const express=require('express')
const adminrouter=express.Router()
const adminController=require('../../controllers/admin/admincontroler')
const coupenController=require('../../controllers/coupen/coupencontroller')
const catogerycontroller=require('../../controllers/catogery/catogerycontroler')
const bannercontroller=require('../../controllers/banner/bannercontroller')
const dashbordcontroller=require('../../controllers/dashbord/dashbordcontroller')
const midlewear=require('../../miidlewears/midelwears')



adminrouter.get('/login',adminController.loadadmin)
adminrouter.get('/',midlewear.isadmin,adminController.loadadminhome)
adminrouter.get('/userlist',midlewear.isadmin,adminController.loaduserlist)
adminrouter.get('/editproduct',midlewear.isadmin,catogerycontroller.loadeditproduct)
adminrouter.get('/catogerylist',midlewear.isadmin,catogerycontroller.loadcatogery)
adminrouter.get('/addcatogery',midlewear.isadmin,catogerycontroller.loadaddcatogery)
adminrouter.get('/addproduct',midlewear.isadmin,catogerycontroller.loadaddproduct)
adminrouter.get('/productlist',midlewear.isadmin,catogerycontroller.loadproductlist)
adminrouter.get('/editcatogery',midlewear.isadmin,catogerycontroller.loadedite)
adminrouter.get('/deleteorder',midlewear.isadmin,adminController.cancelorder)
adminrouter.get('/changesatatus',midlewear.isadmin,adminController.changestatus)
adminrouter.get('/orderdetiles',midlewear.isadmin,adminController.loadorderdetailes)
adminrouter.get('/coupens',midlewear.isadmin,coupenController.loadCoupon)
adminrouter.get('/addcoupen',midlewear.isadmin,coupenController.loadAddCoupon)
adminrouter.get('/editcoupen',midlewear.isadmin,coupenController.loadEditCoupon)
adminrouter.get('/addbanner',midlewear.isadmin,bannercontroller.loadAddBanner)
adminrouter.get('/banner',midlewear.isadmin,bannercontroller.loadBanner)
adminrouter.get('/dash-bord',midlewear.isadmin,dashbordcontroller.loadDashboard)
adminrouter.get('/salse-report',midlewear.isadmin,dashbordcontroller.loadSalesReport)
adminrouter.get('/edit-product-image',midlewear.isadmin,catogerycontroller.loadeditproductimage)




adminrouter.post('/sale/daily',midlewear.isadmin,dashbordcontroller.dailySalesReport)
adminrouter.post('/sale/monthly',midlewear.isadmin,dashbordcontroller.monthlySaleReport)
adminrouter.post('/addbanner',midlewear.isadmin,bannercontroller.addBanner)
adminrouter.post('/editcoupen',midlewear.isadmin,coupenController.editCoupon)
adminrouter.post('/addcoupen',midlewear.isadmin,coupenController.addCoupon)
adminrouter.post('/editaccess',adminController.editaccess)
 adminrouter.post('/login',adminController.verifyadmin)
 adminrouter.post('/addcatogery',catogerycontroller.createcatogery)
 adminrouter.post('/editcatogery',catogerycontroller.updatecatogery)
 adminrouter.post('/editproduct',catogerycontroller.editproduct)
 adminrouter.post('/addproduct',catogerycontroller.creareproduct)
 adminrouter.delete('/deleteproduct',midlewear.isadmin,catogerycontroller.deleteproduct)
 adminrouter.delete('/product-image-delete',midlewear.isadmin,catogerycontroller.deleteProductImage)

 module.exports=adminrouter
 
