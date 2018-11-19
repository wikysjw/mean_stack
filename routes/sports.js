var express = require("express");
var router = express.Router();
var Sport = require("../models/Sport");

// Index
router.get("/", function(req, res){
    Sport.find({})
    .sort("-createdAt")
    .exec(function(err, sports){
        if(err) return res.json(err);
        res.render("sports/index", {sports:sports});
    });
});

// New
router.get("/new", function(req, res){
    res.render("sports/new");
});

// create
router.post("/", function(req, res){
    Sport.create(req.body, function(err, sport){
        if(err) return res.json(err);
        res.redirect("/sports");
    });
});     

// show
router.get("/:id", function(req, res){
    Sport.findOne({_id:req.params.id}, function(err, sport){
        if(err) return res.json(err);
        res.render("sports/show", {sport:sport});
    });
});

// edit
router.get("/:id/edit", function(req, res){
    Sport.findOne({_id:req.params.id}, function(err, sport){
        if(err) return res.json(err);
        res.render("sports/edit", {sport:sport});
    });
});

// update
router.put("/:id", function(req, res){
    req.body.updatedAt =Date.now();
    Sport.findOneAndUpdate({_id:req.params.id}, req.body, function(err, sport){
        if(err) return res.json(err);
        res.redirect("/sports/"+req.params.id);
    });
});

// destroy
router.delete("/:id", function(req, res){
    Sport.remove({_id:req.params.id}, function(err){
        if(err) return res.json(err);
        res.redirect("/sports");
        console.log(req.params.id);
    });
});

module.exports = router;
