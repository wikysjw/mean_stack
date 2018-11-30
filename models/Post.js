var mongoose = require("mongoose");
var util = require("../util");

// schema
var postSchema = mongoose.Schema({
    title:{type:String, required:[true,"제목을 적어주세요."]},
    body:{type:String, required:[true,"본문을 작성해주세요."]},
    createdAt:{type:Date, default:Date.now},
    updated:{type:Date}
},{
    toObject:{virtuals:true}
});

// virtuals
postSchema.virtual("createdDate")
.get(function(){
    return util.getDate(this.createdAt);
});

postSchema.virtual("createdTime")
.get(function(){
    return util.getTime(this.createdAt);
});

postSchema.virtual("updatedDate")
.get(function(){
    return util.getDate(this.updatedAt);
});

postSchema.virtual("updatedTime")
.get(function(){
    return util.getTime(this.updatedAt);
});

// model & export
var Post = mongoose.model("post", postSchema);
module.exports = Post;

// functions
// function getDate(dateObj){
//     if(dateObj instanceof Date)
//     return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth()+1)+ "-" + get2digits(dateObj.getDate());
// }

// function getTime(dateObj){
//     if(dateObj instanceof Date)
//     return get2digits(dateObj.getHours()) + "-" + get2digits(dateObj.getMinutes())+ "-" +get2digits(dateObj.getSeconds());
// }

// function get2digits(num){
//     return ("0" + num).slice(-2);
// }