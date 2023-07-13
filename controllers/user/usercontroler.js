const { render } = require('ejs');
const User=require('../../model/user/usermodel')
const bcrypt=require('bcrypt')
const nodemailer=require('nodemailer')
const bodyparser=require('body-parser')
const speakeasy=require('speakeasy')
const product=require('../../model/product/productmodel');
const productmodel = require('../../model/product/productmodel');
const addressmodel=require('../../model/address/addressmodel');
const usermodel = require('../../model/user/usermodel');
const orderitemmodel = require('../../model/order-item/orderitemmodel');
const ordermodel = require('../../model/order/ordermodel');



const makeotp=()=>{
    try {
        const secret=speakeasy.generateSecret({length:20})
         const token=speakeasy.totp({
            secret:secret.base32,
            encoding:'base32'
        })
        return {token ,secret}
    } catch (error) {
        console.log(error.message);
    }
    
}

const loadsignup=async (req,res)=>{
    try{
if(req.session.session_id){
    res.redirect('/')
}else{
    res.render('./user/signup',{message:''})
}
    }catch(e){
        console.log(e.message);
    }
}

const loadlogin=async (req,res)=>{
    try{
if(req.session.session_id){
    res.redirect('/')
}else{
    res.render('./user/login',{message:''})
}
    }catch (e){
        console.log(e.message);
    }
}

const loadHome=async (req,res)=>{
    try{
        const product=await productmodel.find({quantity:{$gt:0}})
           res.render('./user/home',{message:'',product,session_id:req.session.session_id})

    }catch (e){
        console.log(e.message);
    }
}

const sendverifyemail= async(name,email,user_id)=>{
    try {
        const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'marakadians@gmail.com',
                pass:'mnfpzaetsetikufj'
            }
    
        })
        let mailoptions
        if(name==null){
             mailoptions={
                from:'mannilmuhsin3@gmail.com',
                to:email,
                subject:'for verification mail',
                html:'<p>your otp is '+user_id+'</p>'
            }
        }else{
             mailoptions={
                from:'mannilmuhsin3@gmail.com',
                to:email,
                subject:'for verification mail',
                 html:'<p>hi'+name+',please click here to <a href="http://127.0.0.1:3313/verify?id='+user_id+'">verify</a>your email </p>'
                
            }
        }    

        transporter.sendMail(mailoptions,(error,data)=>{
            if(error){
                console.log(error)
            }else{
                console.log('Email has been sent ',data.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}

const createUser=async (req,res)=>{
    try{
const username=req.body.username
const email=req.body.email
const password=req.body.password

const userdata=await User.findOne({email:email})

if(userdata){
    res.render('./user/signup',{message:'this email all redy used'})
}else{

    if(req.body.password!==req.body.repassword){
        res.render('./user/signup',{message:'password not matching'})
    }else{

    const hashpass=await bcrypt.hash(password,10)
    const newuser=new User({
        username:username,
        email:email,
        password:hashpass,
        verifide:false,
        isadmin:false
    })
       const userdata=await newuser.save()
//     sendverifyemail(req.body.username,req.body.email,userdata._id)
//     res.redirect('/witing')
const token=makeotp()
console.log(token.secret.base32);
console.log(token.token);
req.session.secret=token.secret.base32
req.session.session_id=userdata._id
sendverifyemail(null,email,token.token)
// res.redirect('/')
res.render('./verify/otp')
}
}
    }catch (e){
        console.log(e.message);
    }
}

const verifyemail=async(req,res)=>{
    try {
        
        const id=req.query.id
        const strid=id.toString()
        
         
        const user=await User.findOne({_id:strid})
        if(user){
            user.verifide=true
          
            await user.save()
            res.redirect('/login')
        }else{
            res.redirect('/signup')
        }

        } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin=async (req,res)=>{
    try{
        const email=req.body.email
        const password=req.body.password
        
        const userdata=await User.findOne({email:email})

        if(userdata){
            const passMatch=await bcrypt.compare(password,userdata.password)

            if(passMatch){
                if(userdata.verifide==true){
                    if(userdata.access==true){
                        // const token=makeotp()
                        // console.log(token.secret.base32);
                        // console.log(token.token);
                        // req.session.secret=token.secret.base32
                        req.session.session_id=userdata._id
                        // sendverifyemail(null,email,token.token)
                        res.redirect('/')
                        // res.render('./verify/otp')
                    }else{
                        res.render('./user/login',{message:'this account is blocked'})
                    }
                }else{
                    res.render('./user/login',{message:'email not verified'})
                }
               
            }else{
                res.render('./user/login',{message:'password incorrected'})
            }
        }else{
            res.render('./user/login',{message:'incorrect password or email'})
        }
        
    }catch (e){
        console.log(e.message);
    }
}

const loadveryfi=async (req,res)=>{
    try {
        res.render('./verify/verify')
    } catch (error) {
        console.log(error.message);
    }
}


const verifyotp=async (req,res)=>{
    try {
        console.log('first');
        const validation=speakeasy.totp.verify({
            secret:req.session.secret,
            encoding:'base32',
            token:req.body.otp,
            window:0
        })


        req.session.secret=null
       
        console.log(validation);
        if(validation){
            console.log('third');
            const user=await User.findOne({_id:req.session.session_id})
        if(user){
            user.verifide=true
          
            await user.save()
            res.redirect('/login')
        }else{
            res.redirect('/signup')
        }

            
            // res.redirect('/')
        }else{
            req.session.destroy();
            // req.session.session_id=null
            res.clearCookie('user_id')
            res.render('./user/login',{message:'OTP NOT MACHING try again'})

        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadotp=async(req,res)=>{
    try {
        res.render('./verify/otp',{message:''})
    } catch (error) {
        console.log(error.message);
    }
}



//for load user profile

const loaduserprofile=async(req,res)=>{
    try {
        const orderlist = await ordermodel.find({user:req.session.session_id}).populate('user','username')
        .populate({path:'orderitems',populate:{path:'product',populate:'catogery'}})
        

        const user=await usermodel.findOne({_id:req.session.session_id})
        const address=await addressmodel.find({userid:req.session.session_id})
      
        res.render('./user/userprofile',{user,address,orderlist})
    } catch (error) {
        console.log(error.message);
    }
}

//load addaddress

const loadaddress=async(req,res)=>{
    try {
        res.render('./user/addaddress')
    } catch (error) {
        console.log(error.message);
    }
}
// for creat new address

const addnewaddress=async(req,res)=>{
    try {
        console.log(req.body.fullName)
        const newuseraddress=new addressmodel({
            userid:req.session.session_id,
            name:req.body.fullName,
            mobile:req.body.mobileNumber,
            pin:req.body.pincode,
            locality:req.body.locality,
            address:req.body.address,
            city:req.body.city,
            state:req.body.state
        }) 

        const useraddress = await newuseraddress.save()
        res.redirect('/userprofile')

    } catch (error) {
        console.log(error.message);
    }
}
//for load edit adreess

const loadeditaddress=async(req,res)=>{
    try {
        const address=await addressmodel.findOne({_id:req.query.id})
        res.render('./user/editaddress',{address})
    } catch (error) {
        console.log(error.message);
    }
}

//.for edit address

const editaddress=async (req,res)=>{
    try {
        await addressmodel.updateMany({_id:req.query.id},{$set:{
            name:req.body.fullName,
            mobile:req.body.mobileNumber,
            pin:req.body.pincode,
            locality:req.body.locality,
            address:req.body.address,
            city:req.body.city,
            state:req.body.state

        }})
        res.redirect('/userprofile')
    } catch (error) {
        console.log(error.message);
    }
}
// for load edit profile

const loadeditprofile=async (req,res)=>{
    try {
        const user= await User.findOne({_id:req.session.session_id})
        res.render('./user/editprofile',{user})
       
        
    } catch (error) {
        console.log(error.message);
    }
}
//for edite profile

const editprofile=async(req,res)=>{
    try {
        await User.updateOne({_id:req.query.id},{$set:{
            username:req.body.username
        }})
        res.redirect('/userprofile')
    } catch (error) {
        console.log(error.message);
    }
}
//for change password

const loadchangpassword=async(req,res)=>{
    try {
        res.render('./user/changepassword',{message:''})
    } catch (error) {
        console.log(error.message);
    }
}
// for chagepasseord

const change_password=async(req,res)=>{
    try {
        const oldpassword=await User.findOne({_id:req.session.session_id})

        console.log(oldpassword);
        const passMatch=await bcrypt.compare(req.body.currentPassword,oldpassword.password)
        if(passMatch){
            if(req.body.newPassword==req.body.confirmPassword){
                const hashpass=await bcrypt.hash(req.body.newPassword,10)

                await User.updateOne({_id:oldpassword._id},{$set:{
                    password:hashpass
                }})
                res.redirect('/userprofile')

            }else{
                res.render('./user/changepassword',{message:'Conform Password Is Not Maching '})
            }
        }else{
            res.render('./user/changepassword',{message:'Incorruct Current Password  '})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

// user logout

const logout=async (req,res)=>{
    try {
        req.session.session_id=null
       res.redirect('/') 
    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    loadsignup,
    loadlogin,
    loadHome,
    createUser,
    verifyLogin,
    verifyemail,
    loadveryfi,
    verifyotp,
    loadotp,
    
    loaduserprofile,
    loadaddress,
    addnewaddress,
    loadeditaddress,
    editaddress,
    loadeditprofile,
    editprofile,
    loadchangpassword,
    change_password,
    logout
}