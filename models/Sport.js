var mongoose = require("mongoose");

// schema
var sportSchema = mongoose.Schema({
    title:{type:String, require:true},
    body:{type:String},
    createdAt:{type:Date, default:Date.now},
    updated:{type:Date},
    img:{}
},{
    toObject:{virtuals:true}
});

// virtuals
sportSchema.virtual("createdDate")
.get(function(){
    return getDate(this.createdAt);
});

sportSchema.virtual("createdTime")
.get(function(){
    return getTime(this.createdAt);
});

sportSchema.virtual("updatedDate")
.get(function(){
    return getTime(this.updatedAt);
});

sportSchema.virtual("updatedDate")
.get(function(){
    return getTime(this.updatedAt);
});

// model & export
var Sport = mongoose.model("sport", sportSchema);
module.exports = Sport;

// functions
function getDate(dateObj){
    if(dateObj instanceof Date)
    return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth()+1)+ "-" + get2digits(dateObj.getDate());
}

function getTime(dateObj){
    if(dateObj instanceof Date)
    return get2digits(dateObj.getHours()) + "-" + get2digits(dateObj.getMinutes())+ "-" +get2digits(dateObj.getSeconds());
}

function get2digits(num){
    return ("0" + num).slice(-2);
}