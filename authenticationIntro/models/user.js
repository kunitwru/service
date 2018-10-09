var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    website: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true,
    },
    passwordConf: {
        type: String,
        required: true,
    },
    userCode: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: false,
        default: "/images/noavatar.png"
    },
    newMessage: {
        type: String,
        required: false,
        default: null
    },
    role: {
        type: Boolean,
        required: true,
        default: 0
    },
    hotline: {
        type: String,
        required: false
    },
    isVip: {
        type: Boolean,
        required: true,
        default: 0
    },
    vipExpires: {
        type: String,
        default: null
    }
});

//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({email: email})
        .exec(function (err, user) {
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            })
        });
}

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});

UserSchema.pre('save', function (next) {
    var user = this;
    User.findOne({email: user.email})
        .exec(function (err, user) {
            if (err) {
                return next(err)
            } else if (user) {
                var err = new Error("Email is ready");
                return next(err);
            }
        });
})


var User = mongoose.model('User', UserSchema);
module.exports = User;
