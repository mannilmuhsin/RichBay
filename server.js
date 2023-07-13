require('dotenv').config()
const express=require('express')
const app=express()
const userrouter=require('./routers/user/userrouter')
const adminrouter=require('./routers/admin/adminrouter')
const fileupload=require('express-fileupload')


const session=require('express-session')
const mongoose=require('mongoose')


app.set('view engine','ejs')

mongoose
    .connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(()=>{
        console.log("connected to MongoDB");
    })
    .catch((err)=>{
        console.error("Error connection to MongoDB: ",err);
    })


app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {sameSite: 'strict'},
    saveUninitialized: true,
    resave: false 
}))
app.use(fileupload({
    useTempFiles:true,    
  limits: { fileSize: 50 * 1024 * 1024 },
}))
app.use(express.static("static"));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use('/',userrouter)
app.use('/admin',adminrouter)



app.listen(3313,()=>{
    console.log('server running')
})