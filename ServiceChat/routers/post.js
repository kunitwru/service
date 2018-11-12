var express = require('express');
var router = express.Router();
var randomstring = require("randomstring");
var multer = require('multer');
const { body } = require('express-validator/check');
//model
const Post = require('../models/post.model');
const User = require('../models/user.model');

const fs = require('fs');
var path = require('path');

var upload = multer({dest: '/tmp/'});


router.post('/posts/fileUpload', upload.single('image'), function (req, res) {
    var ext = path.extname(req.file.originalname).toLowerCase();
    var typeArray = ['.png', '.gif', '.jpg'];
    if (typeArray.indexOf(ext) < 0) {
        return res.json({
            message: 'Lựa chọn ảnh không hợp lệ',
            ret: 'NG'
        });

    }
    var file = process.cwd() + '/public/images/uploads/' + req.body.user_id + ext;
    fs.rename(req.file.path, file, function (err) {
        if (err) {
            res.send(500);
        } else {
            User.updateOne({_id: req.body.user_id}, {
                $set: {
                    avatar: '/images/uploads/' + req.body.user_id + ext
                }
            })
                .exec((err, result) => {
                    if (err) {
                        return res.json({
                            message: 'Update database có vấn đề.',
                            ret: 'NG'
                        });
                    }
                    return res.json({
                        ret: 'OK',
                        message: 'File uploaded successfully',
                        filename: req.body.user_id + ext,
                    });
                });

        }
    });
});


function checkLogined(req, res, next) {
    User.findOne({_id: req.session.userId, role: true})
        .exec(function (error, user) {
            if (error) {
                return res.redirect("/");
            } else {
                if (user === null) {
                    return res.redirect("/");
                } else {
                    return next();
                }
            }
        });
}

router.get('/', function(req, res){
    var condition = {};
    if (req.query.key) {
        condition = {
            title : req.query.key
        }
    }
    Post.find(condition)
        .exec(function (error, posts) {
            if (error) {
                return res.send("Có lỗi xảy ra");
            } else {
                res.render("posts/index", {posts: posts, query: req.query})
            }
        });    
});


router.get("/add", checkLogined, function(req, res){
    res.render("posts/add", {errors : {}});
});

router.post("/add", upload.single('images'), function(req, res){
    req.checkBody('title', 'Bạn phải nhập tiêu đề').notEmpty();
    req.checkBody('content', 'Nội dung chính phải nhập').notEmpty();
    // errors = req.validationErrors();
    var errors = req.validationErrors();
    if(req.file == undefined) {
        if(!errors) {
            errors = [];
        }
        errors.push({location:'body', param: 'images', msg : 'Ảnh bắt buộc phải nhập', value : ''});
        return res.render('posts/add', { errors: errors, params : req.body });
    }
    var ext = path.extname(req.file.originalname).toLowerCase();
    var typeArray = ['.png', '.gif', '.jpg'];
    if (typeArray.indexOf(ext) < 0) {
        if(!errors) {
            errors = [];
        }
        errors.push({location:body, param: images, msg : 'Tập tên ảnh không chính xác', value : ''})
        return res.render("posts/add", {errors : errors});
    }
    if (errors) {
        res.render('posts/add', { errors: errors, params : req.body });
    }
    var filename = randomstring.generate(7);
    var fileNew = process.cwd() + '/public/posts/' + filename + ext;
    fs.rename(req.file.path, fileNew, function (err) {
        if (err) {
            res.send(500);
        } else {
            req.body.images = '/posts/' + filename + ext;
            var postData = {
                title: req.body.title,
                content: req.body.content,
                images: req.body.images,
                status: true,
            }
            Post.create(postData, function(errors, post){
                if (errors) {
                    return res.render("posts/add", {errors: errors});
                } else {
                    return res.redirect('/post');
                }
            })
        }
    });
});

router.get("/edit/:id", checkLogined, function(req, res) {
    Post.findById(req.params.id)
        .exec(function (error, post) {
            if (error) {
                return res.send("Có lỗi xảy ra");
            } else {
                if (post === null) {
                    return res.send("Có lỗi xảy ra");
                } else {
                    return res.render('posts/edit', {params: post, errors : {}});
                }
            }
        });
})

router.post('/edit/:id', upload.single('images'), function(req,res) {
    req.checkBody('title', 'Bạn phải nhập tiêu đề').notEmpty();
    req.checkBody('content', 'Nội dung chính phải nhập').notEmpty();
    var errors = req.validationErrors();
    if(req.file != undefined) {
        var ext = path.extname(req.file.originalname).toLowerCase();
        var typeArray = ['.png', '.gif', '.jpg'];
        if (typeArray.indexOf(ext) < 0) {
            if(!errors) {
                errors = [];
            }
            errors.push({location:body, param: images, msg : 'Tập tên ảnh không chính xác', value : ''})
            return res.render("posts/edit", {errors : errors});
        }else {
            var filename = randomstring.generate(7);
            var fileNew = process.cwd() + '/public/posts/' + filename + ext;
            fs.rename(req.file.path, fileNew, function (err) {
                if (err) {
                    res.send(500);
                } else {
                    req.body.images = '/posts/' + filename + ext;
                }
            });
        }
    }
    if (errors) {
        res.render('posts/add', { errors: errors, params : req.body });
    }

    Post.findById(req.params.id)
        .exec(function (error, post) {
            if (error) {
                return res.send("Có lỗi xảy ra");
            } else {
                if (post === null) {
                    return res.send("Có lỗi xảy ra");
                } else {
                    Post.updateOne({_id: req.params.id}, {$set: req.body})
                        .exec()
                        .then(result => {
                            return res.redirect("/post");
                        })
                        .catch(err => console.log(err));
                    var fileDel = process.cwd() + '/public' + post.images;

                    fs.unlink(fileDel, function(err) {
                        if(err) {
                            return res.send("Xóa ảnh bị lỗi");
                        }
                        console.log("Upload success!");
                    });
                }
            }
        });
})

module.exports = router;