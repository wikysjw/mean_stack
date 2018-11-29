var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var session = require("express-session");
var passport = require("./config/passport");
var app = express();
const hostname = '192.168.0.167';

// DB 연결
// mongoose.connect(process.env.MONGO_DB, {useNewUrlParser:true}); //- 환경변수로 연동시 환경변수를 MONGO_DB로 만들어 사용
mongoose.connect('mongodb://127.0.0.1:27017/mean');
var db = mongoose.connection;
db.once("open", function(){
    console.log("DB connect");
    console.log(process.env.MONGO_DB);
    console.log(process.env.OneDrive);
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
app.use(flash());
app.use(session({secret:"shit", resave:true, saveUninitialized:true}));

// Passport
app.use(passport.initialize()); // 패스포트를 초기화
app.use(passport.session()); // 패스포트와 세션을 연결

// Middelewares
app.use(function(req, res ,next){
    res.locals.isAuthenticated = req.isAuthenticated(); // passport제공함수 로그인상태확인
    res.locals.currentUser = req.user; // 로그인된 유저정보 불러오기
    next();
});

// Routes
app.use("/", require("./routes/home"));
app.use("/posts", require("./routes/posts"));
app.use("/sports", require("./routes/sports"));
app.use("/users", require("./routes/users"));
app.use("/aa", require("./routes/image"));

// Port setting
var port = process.env.PORT || 5105;
app.listen(port,hostname ,function(){
    console.log("server on!");
});