var express = require('express');
var router = express.Router();
var randomstring = require("randomstring");
var multer = require('multer');

const User = require('../models/user');
const Room = require('../models/room');
const fs = require('fs');
var path = require('path');

var upload = multer({dest: '/tmp/'});


router.post('/fileUpload', upload.single('image'), function (req, res) {
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
            User.update({_id: req.body.user_id}, {
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

router.get("/", function (req, res) {
    res.render('trangchu');
})

router.get("/home", function (req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return res.redirect('/login');
            } else {
                if (user === null) {
                    return res.redirect('/login');
                } else {
                    if (user.role) {
                        return res.render("admin", {user: user});
                    }
                    return res.render("home", {user: user});
                }
            }
        });
})

router.get('/login', function (req, res) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return res.render("admin/login", {error: ""});
            } else {
                if (user === null) {
                    return res.render("admin/login", {error: ""});
                } else {
                    return res.redirect("/home");
                }
            }
        });
});

router.get("/members", checkLogined, function (req, res) {
    Room.find({})
        .exec(function (error, rooms) {
            if (error) {
                return res.send("Có lỗi xảy ra");
            } else {
                res.render("users/members", {rooms: rooms})
            }
        });
})

router.post('/login', function (req, res) {
    if (req.body.logemail && req.body.logpassword) {
        User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
            if (error || !user) {
                return res.render('admin/login', {error: "Tên đăng nhập hoặc mật khẩu bị sai"});
            } else {
                req.session.userId = user._id;
                return res.redirect('/home');
            }
        });
    } else {
        return res.render('admin/login', {error: "Tên đăng nhập hoặc mật khẩu bị sai"});
    }
})


// GET route for reading data
router.get('/signup', function (req, res) {
    res.render("admin/signup", {error: ""});
});


//POST route for updating data
router.post('/signup', function (req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
        return res.render("admin/signup", {error: "Passwords do not match."});
    }

    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {

        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            userCode: randomstring.generate(20),
            passwordConf: req.body.passwordConf,
        }

        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                return res.redirect('/home');
            }
        });

    }
})


// show users
router.get("/users", checkLogined, function (req, res) {
    User.find({})
        .exec(function (error, users) {
            if (error) {
                return res.send("Có lỗi xảy ra");
            } else {
                res.render("users/index", {users: users})
            }
        });
});

// get user info
router.get("/users/edit/:id", checkLogined, function (req, res) {
    User.findById(req.params.id)
        .exec(function (error, user) {
            if (error) {
                return res.send("Có lỗi xảy ra");
            } else {
                if (user === null) {
                    return res.send("Có lỗi xảy ra");
                } else {
                    return res.render('users/edit', {user: user});
                }
            }
        });
})

router.post("/users/edit/:id", checkLogined, function (req, res) {
    User.findById(req.params.id)
        .exec(function (error, user) {
            if (error) {
                return res.send("Có lỗi xảy ra");
            } else {
                if (user === null) {
                    return res.send("Có lỗi xảy ra");
                } else {
                    User.update({_id: req.params.id}, {$set: req.body})
                        .exec()
                        .then(result => {
                            return res.redirect("/users");
                        })
                        .catch(err => console.log(err));
                }
            }
        });
})

// delete user
router.delete("/users/delete", checkLogined, function (req, res) {
    User.deleteOne({_id: req.body.id})
        .exec()
        .then(res => {
            res.statusCode = 200;
            return res.json({error: 'OK'});
        });
});


router.get("/users/add", function (req, res, next) {
    res.render('users/add', {error: ""});
});


//POST route for updating data
router.post('/users/add', function (req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
        return res.render("users/add", {error: "Passwords do not match."});
    }

    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {

        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            userCode: randomstring.generate(20),
            passwordConf: req.body.passwordConf,
            isVip: req.body.isVip,
            website: req.body.website,
            vipExpires: req.body.vipExpires,
        }

        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                return res.redirect('/users');
            }
        });

    }
})


// GET route after registering
router.get('/profile', function (req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return res.send("Lỗi rùi")
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    return res.send(err);
                } else {
                    return res.render('users/profile', {user: user})
                }
            }
        });
});

router.post('/profile', function (req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                res.statusCode = 500;
                return res.send("Lỗi rùi")
            }
            if (req.body.password && (req.body.password !== req.body.passwordConf)) {
                return res.render("users/profile", {error: "Mật khẩu không đúng."});
            }
            if (req.body.password) {
                var userData = {
                    username: req.body.username,
                    newMessage: req.body.newMessage,
                    password: req.body.password,
                    passwordConf: req.body.passwordConf,
                    website : req.body.website,
                    hotline : req.body.hotline
                }
            } else {
                var userData = {
                    username: req.body.username,
                    newMessage: req.body.newMessage,
                    website : req.body.website,
                    hotline : req.body.hotline
                }
            }
            User.update({_id: user._id}, {$set: userData})
                .exec((err, result) => {
                    if (err) {
                        res.statusCode = 500;
                        return res.send("Lỗi ở database rùi")
                    }
                    return res.redirect('/profile');
                })
        })
});


// GET for logout logout
router.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

module.exports = router;
