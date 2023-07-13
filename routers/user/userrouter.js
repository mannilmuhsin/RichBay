const { render } = require('ejs')
const express=require('express')
const userrouter=express.Router()
const usercontroller=require('../../controllers/user/usercontroler')
const cartcontroller=require('../../controllers/cartcontroller/cartcontroller')
const catogerycontroller=require('../../controllers/catogery/catogerycontroler')
const ordercontroller=require('../../controllers/order/ordercontroller')
const midelwear=require('../../miidlewears/midelwears')




userrouter.get('/',usercontroller.loadHome)
userrouter.get('/signup',usercontroller.loadsignup)
userrouter.get('/login',usercontroller.loadlogin)
userrouter.get('/verify',usercontroller.verifyemail)
userrouter.get('/witing',usercontroller.loadveryfi)
userrouter.get('/getotp',usercontroller.loadotp)
userrouter.get('/cart',midelwear.islogin,cartcontroller.loadcart)
userrouter.get('/checkout',midelwear.islogin,ordercontroller.loadcheckout)
userrouter.get('/userprofile',midelwear.islogin,usercontroller.loaduserprofile)
userrouter.get('/addaddress',midelwear.islogin,usercontroller.loadaddress)
userrouter.get('/editaddress',midelwear.islogin,usercontroller.loadeditaddress)
userrouter.get('/editprofile',midelwear.islogin,usercontroller.loadeditprofile)
userrouter.get('/change_password',midelwear.islogin,usercontroller.loadchangpassword)
userrouter.get('/logout',usercontroller.logout)
userrouter.get('/productdetiles',catogerycontroller.loadproductdetiles)
userrouter.get('/addtocart',midelwear.islogin,cartcontroller.addtocart)
userrouter.get('/removeonefromcart',midelwear.islogin,cartcontroller.removeonefromcart)
userrouter.get('/cancelorder',midelwear.islogin,ordercontroller.cancelorder)



userrouter.post('/addtocart',cartcontroller.addtocart)
userrouter.post('/signup',usercontroller.createUser)
userrouter.post('/login',usercontroller.verifyLogin)
userrouter.post('/getotp',usercontroller.verifyotp)
userrouter.post('/addaddress',usercontroller.addnewaddress)
userrouter.post('/editaddress',usercontroller.editaddress)
userrouter.post('/editprofile',usercontroller.editprofile)
userrouter.post('/change_password',usercontroller.change_password)
userrouter.post('/checkout',ordercontroller.creatorder)


module.exports=userrouter