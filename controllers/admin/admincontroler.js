
const ordermodel = require('../../model/order/ordermodel');
const User=require('../../model/user/usermodel')
const productmodel=require('../../model/product/productmodel')



const loadadmin=async (req,res)=>{
    try {
        if(req.session.admin_id){
            res.redirect('/admin')
        }else{

            res.render('./admin/admin',{message:''})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const verifyadmin=async (req,res)=>{
    try {
        const admindata=await User.findOne({email:req.body.email})
        if(admindata){
            if(admindata.isadmin==true){
                req.session.admin_id=admindata.id
                res.redirect('/admin')
            }else{
                res.render('./admin/admin',{message:'you are not admin'})
            }

        }else{
            res.render('./admin/admin',{message:'admin not fount'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loaduserlist=async (req,res)=>{
    try {
        const users=await User.find({})
        const usercount=await User.find().count()
        res.render('./admin/userlist',{User:users,usercount})
    } catch (error) {
        console.log(error.message);
    }
}
const editaccess=async(req,res)=>{
    try {
        if(req.query.value=='true'){
            console.log('first');
            req.session.session_id=null
            await User.updateOne({_id:req.query.id},{$set:{access:false}})
            
        }else if(req.query.value=='false'){
            await User.updateOne({_id:req.query.id},{$set:{access:true}})
            
        }
        
        res.redirect('/admin/userlist')
    } catch (error) {
        console.log(error.message);
    }
}

const loadadminhome=async(req,res)=>{
    try {
        const procount=await productmodel.find().count()
        const orderlist = await ordermodel.find().populate('user','username')
        .populate({path:'orderitems',populate:{path:'product',populate:'catogery'}})
        .sort({'dateorder':-1})
        res.render('./admin/adminhome',{orderlist,procount})
    } catch (error) {
        console.log(error.message);
    }
}

//for delete order from admin 

const cancelorder=async (req,res)=>{
    try {
        await ordermodel.deleteOne({_id:req.query.id})
        res.json({response:true})
    } catch (error) {
        console.log(error.message);
    }
}
//for change status

const changestatus=async(req,res)=>{
    try {
        await ordermodel.updateOne({_id:req.query.id},{$set:{status:req.query.status}})
        if(req.query.status=='Deliverd'){
            const now = new Date();
            const dateAfterNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

            await ordermodel.updateOne({_id:req.query.id},{$set:{returntime:dateAfterNow}})
        }
        res.json({response:true})
    } catch (error) {
        console.log(error.message);
    }
}
//for load order detailes

const loadorderdetailes= async(req,res)=>{
    try {
        const thisorder = await ordermodel.find({_id:req.query.id}).populate('user','username').populate('shippingaddress')
        .populate({path:'orderitems',populate:{path:'product',populate:'catogery'}})
        const order=thisorder[0]
        res.render('./admin/ordredetales',{order})
    } catch (error) {
        console.log(error.message);
    }
}

//for load admin dash bord

const loaddashbord=async (req,res)=>{
    try {
        res.render('./admin/admindashbord')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    loadadmin,
    verifyadmin,
    loaduserlist,
    editaccess,
    loadadminhome,
    cancelorder,
    changestatus,
    loadorderdetailes,
    loaddashbord
}