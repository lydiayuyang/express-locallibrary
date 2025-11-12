const mongoose = require("mongoose");

const localURI="mongodb://127.0.0.1:27017/my_database";
const atlasURI= process.env.MONGODB_URI;
const mongoDB=process.env.NODE_ENV==="production" ? atlasURI:localURI;

mongoose.connect(mongoDB);

const db=mongoose.connection;
db.on("error",console.error.bind(console, "MongoDB connection error:"));
db.once("open",()=>{
    console.log("MongoDB connected successfully! Current URI:", mongoDB);
});


module.exports =db;
