var passport = require("passport");

var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/User");

// serialize & deserialize
passport.serializeUser(function(user, done){
    done(null, user.id);
});
passport.deserializeUser(function(id, done){
    User.findOne({_id:id}, function(err, user){
        done(err, user);
    });
});

// local strategy
passport.use("local-login",
 new LocalStrategy({
     usernameField : "username",
     passwordField : "password",
     passReqToCallback : true
 },
 function(req, username, password, done){
     User.findOne({username:username})
     .select({password:1})
     .exec(function(err, user){
         if (err) return done(err);

         if (user && user.authenticate(password)){
             return done(null, user);
         } else {
             req.flash("username", username);
             req.flash("errors", {login:"아이디이나 비밀번호가 일치하지 않습니다."});
             return done(null, false); // done의 첫번째 파라미터는 error을 담기위한 용도 error이 없다면 null을 사용
         }
     });
 }
 )
);

module.exports = passport;