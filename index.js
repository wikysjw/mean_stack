var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var app = express();

// DB 연결
//mongoose.connect(process.env.MONGO_DB, {useNewUrlParser:true}); - 환경변수로 연동시 환경변수를 MONGO_DB로 만들어 사용
mongoose.connect('mongodb://localhost:27017/mean');
var db = mongoose.connection;
db.once("open", function(){
    console.log("DB connect");
});
db.on("error", function(err){
    console.log("DB ERROR : ", err);
});

// Other setting
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

// Routes
app.use("/", require("./routes/home"));
app.use("/posts", require("./routes/posts"));
app.use("/users", require("./routes/users"));

// Port setting
app.listen(5034, function(){
    console.log("server on!");
});