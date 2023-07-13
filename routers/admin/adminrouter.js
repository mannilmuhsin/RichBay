const { render } = require('ejs')
const express=require('express')
const adminrouter=express.Router()
const adminController=require('../../controllers/admin/admincontroler')
const catogerycontroller=require('../../controllers/catogery/catogerycontroler')
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



adminrouter.post('/editaccess',adminController.editaccess)
 adminrouter.post('/login',adminController.verifyadmin)
 adminrouter.post('/addcatogery',catogerycontroller.createcatogery)
 adminrouter.post('/editcatogery',catogerycontroller.updatecatogery)
 adminrouter.post('/editproduct',catogerycontroller.editproduct)
 adminrouter.post('/addproduct',catogerycontroller.creareproduct)
 adminrouter.delete('/deleteproduct',midlewear.isadmin,catogerycontroller.deleteproduct)

 module.exports=adminrouter
 
