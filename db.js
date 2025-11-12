const mongoose = require("mongoose");
const mongoDB = process.env.MONGODB_URI || "mongodb://127.0.0.1/my_database";
mongoose.connect(mongoDB,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error",console.error.bind(console,"MongoDB error:"));

module.exports =db;
