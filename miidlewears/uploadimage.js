const multer=require('multer')
const sharp=require('sharp')
const path=require('path')



const multerStorage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,"../static/img"))
    },
    filename:function(req,file,cb){
        const uniquesuffix=Date.now()+"-"+Math.round(Math.random()*1e9)
        cb(null,file.fieldname+"-"+uniquesuffix+".jpeg")
    }
})

const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith("image")){
        cb(null,true);

    }else{
        cb(
            {
                message:"unsopported file"
            },
            false
        )
    }
}


const uploadphoto=multer({

    storage:multerStorage,
    fileFilter:multerFilter,
    limits:{fileSize:2000000}
})