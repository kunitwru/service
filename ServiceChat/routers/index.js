var express = require('express');
var router = express.Router();

const helpers = require('../helper/helper');

var randomstring = require("randomstring");
var multer = require('multer');
const {body} = require('express-validator/check');
//model
const Room = require('../models/room.model');
const User = require('../models/user.model');
const Vips = require('../models/vips.model');

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

function checkLoginedAll(req, res, next) {
    User.findOne({_id: req.session.userId})
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


// router index
router.get("/client/:code", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var userCode = req.params.code.trim();
    if (!userCode) {
        return res.json({error: "ABC"});
    }
    User.findOne({userCode: userCode})
        .exec((error, user) => {
            if (error) {
                return console.log(error);
            }
            if (user === null) {
                return res.render("chat/client", {user: ""});
            } else {
                if (req.query.device == 'mobile' && req.query.tab == 'mobile') {
                    return res.render("chat/mobile", {
                        user: user,
                        currentUrl: req.query.url,
                        hostname: req.query.domain,
                        device: req.query.device,
                        tab: req.query.tab
                    });
                }
                return res.render("chat/client", {
                    user: user,
                    currentUrl: req.query.url,
                    hostname: req.query.domain,
                    device: req.query.device,
                    tab: req.query.tab
                });
            }
        });

});

/*
router homepage
 */
router.get("/", function (req, res) {
    res.render("trangchu");
});

/*
router login
 */
router.get("/login", function (req, res) {
    res.render('users/login', {error: ""});
});

router.post('/login', function (req, res) {
    if (req.body.logemail && req.body.logpassword) {
        User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
            if (error || !user) {
                return res.render('users/login', {error: "Tên đăng nhập hoặc mật khẩu bị sai"});
            } else {
                req.session.userId = user._id;
                return res.redirect('/home');
            }
        });
    } else {
        return res.render('users/login', {error: "Tên đăng nhập hoặc mật khẩu bị sai"});
    }
});
/*
signup
 */
// GET route for reading data
router.get('/signup', function (req, res) {
    res.render("users/signup", {errors: {}});
});

//POST route for updating data
router.post('/signup', body('email').custom(value => {
    return User.findOne({email: value}).then(user => {
        if (user) {
            return Promise.reject('Email đã được sử dụng');
        }
    });
}), function (req, res, next) {

    req.checkBody("email", "Bạn nhập không phải là email.").isEmail();
    req.checkBody("username", "Tên bắt buộc phải nhập.").notEmpty();
    req.checkBody("password", "Mật khẩu bắt buộc phải nhập.").notEmpty();
    req.checkBody("website", "Tên web bắt buộc phải nhập.").isURL();
    req.checkBody("passwordConf", "Mật khẩu confirm không đúng").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        res.render('users/signup', {errors: errors, params: req.body});
        return;
    }

    var userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        userCode: randomstring.generate(20),
        passwordConf: req.body.passwordConf,
        website: req.body.website
    }

    User.create(userData, function (error, user) {
        if (error) {
            return next(error);
        } else {
            req.session.userId = user._id;
            return res.redirect('/home');
        }
    });

})


router.get("/members", checkLogined, function (req, res) {
    Room.find({}).sort({created: -1})
        .exec(function (error, rooms) {
            if (error) {
                return res.send("Có lỗi xảy ra");
            } else {
                console.log(rooms);
                res.render("users/members", {rooms: rooms})
            }
        });
})

router.get("/home", function (req, res) {
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

// show users
router.get("/users", function (req, res) {
    var condition = {};
    if (req.query.key) {
        condition = {
            email: req.query.key
        }
    }
    User.find(condition)
        .exec(function (error, users) {
            if (error) {
                return res.send("Có lỗi xảy ra");
            } else {
                res.render("users/index", {users: users, query: req.query})
            }
        });
});

router.get("/users/add", function (req, res, next) {
    res.render('users/add', {errors: {}});
    return;
});


//POST route for updating data

router.post('/users/add', body('email').custom(value => {
    return User.findOne({email: value}).then(user => {
        if (user) {
            return Promise.reject('Email đã được sử dụng');
        }
    });
}), function (req, res, next) {
    req.checkBody("email", "Bạn nhập không phải là email.").isEmail();
    req.checkBody("username", "Tên bắt buộc phải nhập.").notEmpty();
    req.checkBody("password", "Mật khẩu bắt buộc phải nhập.").notEmpty();
    req.checkBody("website", "Tên web bắt buộc phải nhập.").isURL();
    req.checkBody("passwordConf", "Mật khẩu confirm không đúng").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        res.render('users/add', {errors: errors, params: req.body});
        return;
    }

    var userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        userCode: randomstring.generate(20),
        passwordConf: req.body.passwordConf,
        isVip: req.body.isVip,
        website: req.body.website,
        created: Date.now(),
        updated: Date.now()
    }

    if ((req.body.isVip == 1) && (req.body.countVip > 0)) {
        var m = new Date();
        m.setMonth(m.getMonth() + parseInt(req.body.countVip));
        userData.vipExpires = m;
    }
    if (req.body.isVip == 0) {
        req.body.vipExpires = null;
    }
    User.create(userData, function (errors, user) {
        if (errors) {
            return res.render("users/add", {errors: errors});
        } else {
            return res.redirect('/users');
        }
    });

})


/*
profile
 */
router.get('/profile', checkLoginedAll, function (req, res, next) {
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

router.post('/profile', checkLoginedAll, function (req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                res.statusCode = 500;
                return res.send("Lỗi rùi")
            }
            if (req.body.password && (req.body.password !== req.body.passwordConf)) {
                return res.render("users/profile", {error: "Mật khẩu không đúng."});
            }
            var userData = {
                username: req.body.username,
                newMessage: req.body.newMessage,
                website: req.body.website,
                hotline: req.body.hotline,
                message1: req.body.message1,
                message2: req.body.message2
            }
            if (req.body.password) {
                userData.password = req.body.password;
                userData.passwordConf = req.body.passwordConf;
            }

            User.updateOne({_id: user._id}, {$set: userData})
                .exec((err, result) => {
                    if (err) {
                        res.statusCode = 500;
                        return res.send("Lỗi ở database rùi")
                    }
                    return res.redirect('/profile');
                })
        })
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
                    req.body.updated = Date.now();

                    if ((req.body.isVip == 1) && (req.body.countVip > 0)) {
                        var m = new Date(req.body.vipExpires);
                        m.setMonth(m.getMonth() + parseInt(req.body.countVip));
                        req.body.vipExpires = m;
                    }
                    if (req.body.isVip == 0) {
                        req.body.vipExpires = null;
                    }

                    User.updateOne({_id: req.params.id}, {$set: req.body})
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
router.post("/users/delete", checkLogined, function (req, res) {
    User.remove({_id: req.body._id})
        .exec((err, result) => {
            if (err) {
                return res.json({error: 'NG'})
            }
            console.log(result);
            return res.json({error: 'OK'});
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

router.get("/chat", function (req, res) {
    res.render("view");
});

router.get("/vips", checkLoginedAll, function (req, res, next) {
    req.checkQuery("email", "Bạn nhập không phải là email.").isEmail();
    req.checkQuery("name", "Tên bắt buộc phải nhập.").notEmpty();
    req.checkQuery("user", "Form submit bị lỗi").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.statusCode = 400;
        res.json({
            data: errors,
            msg : "Đăng ký gia hạn không thành công."
        });
        return;
    } else {
        Vips.find({email: "yahoo@yahoo.com", status: 0}, function (err, vip) {
            if (err) {
                res.statusCode = 400;
                res.json({
                    msg : "Server bị lỗi."
                });
                return;
            }
            if (vip.length != 0) {
                res.statusCode = 200;
                res.json({
                    msg : "Bạn đã đăng ký gia hạn và đang được xử lý hoặc chưa chuyển khoản cho Admin."
                });
                return;
            } else {
                Vips.create(req.query, function (error, vip) {
                    if(error) {
                        res.statusCode = 400;
                        res.json({
                            data: errors,
                            msg : "Đăng ký gia hạn không thành công."
                        });
                        return false;
                    }
                    res.statusCode = 200;
                    res.json({
                        messages: "OK",
                        msg : "Đăng ký gia hạn thành công.",
                        data: vip
                    });
                    return;
                });
            }
        });

    }
    return;
});

router.get("/admin/vips", checkLogined, function (req, res, next) {
    Vips.find()
        .exec((error, vips) => {
            if (error) {
                res.send("Server bị lỗi rùi.");
                return;
            }
            res.render("users/vips", {vips: vips});
        })
});
router.post("/admin/vipupdate", checkLogined, function (req, res) {
    User.findById(req.body.user)
        .exec((error, user) => {
            if (error) {
                res.json({
                    ret : 'NG',
                    msg : 'Upgrade fail'
                });
                return;
            }
            if (user.length == 0) {
                res.json({
                    ret : 'NG',
                    msg : 'Không tìm thấy user'
                });
                return;
            }
            // upgrade
            var userData = {};
            userData.updated = Date.now();

            if (req.body.month > 0) {
                var m = new Date();
                m.setMonth(m.getMonth() + parseInt(req.body.month));
                userData.vipExpires = m;
                userData.isVip = true;
            }

            User.updateOne({_id: user._id}, {$set: userData})
                .exec()
                .then(result => {
                    Vips.updateOne({_id : req.body._id}, {$set : {status : 1}}, function (err, ret) {
                        if (err) {
                            res.json({
                                ret : 'NG',
                                msg : 'Update status vip thất bại'
                            });
                            return;
                        }
                        res.json({
                            ret : 'OK',
                            msg : 'Thực hiện gia hạn thành công'
                        });
                        return;
                    })
                })
                .catch(err => console.log(err));
        });
    return;
});
module.exports = router;