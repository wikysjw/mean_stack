var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

// schema
var userSchema = mongoose.Schema({
 username:{
     type:String, 
     required:[true,"별명을 적어주세요."],
     match:[/^.{4,12}$/,"4-12글자로 만들어주세요."], 
     unique:true,
    trim:true
},
 password:{
     type:String, 
     required:[true,"패스워드를 입력해주세요."], 
     select:false
    },
 name:{
     type:String,
     required:[true,"이름을 입력해주세요."],
     trim:true
    },
 email:{
     type:String,
     match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/, "이메일 형식을 지켜주세요."],
     trim:true
    }
},{
 toObject:{virtuals:true}
});

// virtuals
userSchema.virtual("passwordConfirmation")
.get(function(){ return this._passwordConfirmation; })
.set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual("originalPassword")
.get(function(){ return this._originalPassword; })
.set(function(value){ this._originalPassword=value; });

userSchema.virtual("currentPassword")
.get(function(){ return this._currentPassword; })
.set(function(value){ this._currentPassword=value; });

userSchema.virtual("newPassword")
.get(function(){ return this._newPassword; })
.set(function(value){ this._newPassword=value; });

// password validation
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMs = "비밀번호를 8-16자리 영어+숫자조합으로 해주세요.";
userSchema.path("password").validate(function(v) {
 var user = this;

 // create user
 if(user.isNew){
  if(!user.passwordConfirmation){
   user.invalidate("passwordConfirmation", "패스워드를 입력해주세요.");
  }
  if(!passwordRegex.test(user.password)){
      user.invalidate("password", passwordRegexErrorMs);
  }
  else if(user.password !== user.passwordConfirmation) {
   user.invalidate("passwordConfirmation", "패스워드가 일치하지않습니다.");
  }
 }

 // update user
 if(!user.isNew){
  if(!user.currentPassword){
   user.invalidate("currentPassword", "이전 비밀번호를 입력해주세요.");
  }
  if(user.currentPassword && !bcrypt.compareSync(user.currentPassword, user.originalPassword)){
   user.invalidate("currentPassword", "이전 비밀번호를 입력해주세요.");
  }
  if(user.newPassword && !passwordRegex.test(user.newPassword)){
      user.invalidate("newPassword", passwordRegexErrorMs);
  }
  else if(user.newPassword !== user.passwordConfirmation) {
   user.invalidate("passwordConfirmation", "패스워드가 일치하지않습니다.");
  }
 }
});

// hash password
userSchema.pre("save", function(next){
    var user = this;
    if(!user.isModified("password")){
        return next();
    } else {
        user.password = bcrypt.hashSync(user.password);
        return next();
    }
});

userSchema.methods.authenticate = function(password){
    var user = this;
    return bcrypt.compareSync(password, user.password);
}

var User = mongoose.model("user", userSchema);
module.exports = User;