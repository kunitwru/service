var mongoose = require('mongoose');

var VipsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email : {
        type: String,
        required: false,
        trim: true
    },
    monthCount: {
        type: Number,
        required: true
    },
    status : {
        type: Number,
        required: true,
        default : 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
});

var Vips = mongoose.model('Vips', VipsSchema);
module.exports = Vips;
