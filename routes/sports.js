var express = require("express");
var router = express.Router();
var Sport = require("../models/Sport");
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
var util = require("../util");

// Mongo URI
const mongoURI = 'mongodb://localhost:27017/mean';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// Index
router.get("/", function(req, res){
  var page = Math.max(1,req.query.page);
    var limit = 3;
    Sport.count({},function(err,count){
        if(err) return res.json({success:false, message:err});
        var skip = (page-1)*limit;
        var maxPage = Math.ceil(count/limit);
    Sport.find({})
    .populate("author")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit)
    .exec(function(err, sports){
        if(err) return res.json(err);
       
        res.render("sports/index", {sports:sports, page:page, maxPage:maxPage});
            
          
    });
    });
});

// New
router.get("/new", util.isLoggedin, function(req, res){
  var sport = req.flash("sport")[0] || {};
  var errors = req.flash("errors")[0] || {};
  res.render("sports/new", { sport:sport, errors:errors });
});

// create
router.post("/", util.isLoggedin, upload.single('file'), (req, res) => {
    req.body.author = req.user._id;
    Sport.create(req.body, function(err, sport){
      if(err){
        req.flash("sport", req.body);
        req.flash("errors", util.parseError(err));
        return res.redirect("/sports/new");
      }
        res.redirect("/sports");
    });
});     

// show
router.get("/:id", function(req, res){
    Sport.findOne({_id:req.params.id})
    .populate("author")
    .exec(function(err, sport){
        if(err) return res.json(err);
        gfs.files.find().toArray((err, files) => {
                // Check if files
                if (!files || files.length === 0) {
                  res.render('index', { files: false });
                } else {
                  files.map(file => {
                    if (
                      file.contentType === 'image/jpeg' ||
                      file.contentType === 'image/png'
                    ) {
                      file.isImage = true;
                    } else {
                      file.isImage = false;
                    }
                  });
                 
                    res.render("sports/show", {sport:sport,files: files, page:req.query.page});
                }
              });
    });
});

// edit
router.get("/:id/edit", util.isLoggedin, checkPermission, function(req, res){
  var sport = req.flash("sport")[0];
  var errors = req.flash("errors")[0] || {};
 if(!sport){
    Sport.findOne({_id:req.params.id}, function(err, sport){
      if(err) return res.json(err);
      res.render("sports/edit", {sport:sport, errors:errors});
    });
  } else {
    sport._id = req.params.id;
    res.render("sports/edit", {sport:sport, errors:errors});
  }
});

// update
router.put("/:id", util.isLoggedin, checkPermission, function(req, res){
  req.body.updatedAt = Date.now();
  Sport.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, sport){
   if(err){
    req.flash("sport", req.body);
    req.flash("errors", util.parseError(err));
    return res.redirect("/sports/"+req.params.id+"/edit");
   }
   res.redirect("/sports/"+req.params.id);
    });
});

// destroy
router.delete("/:id", util.isLoggedin, checkPermission, function(req, res){
    Sport.remove({_id:req.params.id}, function(err){
        if(err) return res.json(err);
        res.redirect("/sports");
        console.log(req.params.id);
    });
});

// @route POST /upload
// @desc  Uploads file to DB
router.post('/upload', upload.single('file'), (req, res) => {
  // res.json({ file: req.file });
  res.redirect('/aa');
});

// @route GET /files
// @desc  Display all files in JSON
router.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Files exist
    return res.json(files);
  });
});

// @route GET /files/:filename
// @desc  Display single file object
router.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    return res.json(file);
  });
});

// @route GET /image/:filename
// @desc Display Image
router.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// @route DELETE /files/:id
// @desc  Delete file
router.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/aa');
  });
});

module.exports = router;

// private
function checkPermission(req, res, next){
  Sport.findOne({_id:req.params.id}, function(err, sport){
      if(err) return res.json(err);
      if(sport.author != req.user.id) return util.noPermission(req, res);

      next();
  });
}