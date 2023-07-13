




const isadmin=(req,res,next)=>{
    if(req.session.admin_id){
        next()
    }else{
        res.redirect('/admin/login')
    }
}
const islogin=(req,res,next)=>{
    if(req.session.session_id){
        next()
    }else{
        res.redirect('/login')
    }
}

module.exports={
    isadmin,
    islogin
}