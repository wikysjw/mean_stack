var express = require("express");
var router = express.Router();
var passport = require("../config/passport");

// HOME
router.get("/", function(req, res){
    res.render("home/welcome");
});
router.get("/about", function(req, res){
    res.render("home/about");
});

// login
router.get("/login", function(req,res){
    var username = req.flash("username")[0];
    var errors = req.flash("errors")[0] || {};
    res.render("home/login",{
        username:username,
        errors:errors
    });
});

// post login
router.post("/login",
function(req,res,next){
    var errors = {};
    var isValid = true;
    if(!req.body.username){
        isValid = false;
        errors.username = "아이디를 적어주세요.";
    } if(!req.body.password){
        isValid = false;
        errors.password = "비밀번호를 적어주세요.";
    }

    if(isValid){
        next();
    } else {
        req.flash("errors",errors);
        res.redirect("/login");
    }
},
passport.authenticate("local-login", {
    successRedirect : "/",
    failureRedirect : "/login"
}
));

// logout
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

module.exports = router;