const mongoose = require("mongoose");

const atlasUser = "lydia_yuyang@outlook.com";
const atlasPassword = "yy821178...";
const atlasDB="yuyang";
const atlasURI= "mongodb+srv://yuyang:yy821178...@cluster0.2ytpmzk.mongodb.net/?appName=Cluster0";

const localURI="mongodb://127.0.0.1:27017/my_database";
const mongoDB=process.env.NODE_ENV==="production" ? atlasURI:localURI;

mongoose.connect(mongoDB,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const db=mongoose.connection;
db.on("error",console.error.bind(console, "MongoDB connection error:"));
db.once("open",()=>{
    console.log("MongoDB connected successfully! Current URI:", mongoDB);
});


module.exports =db;
