var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    images : {
        type: String,
        required: false
    },
    content : {
        type: String,
        required: true
    },
    status : {
        type: Boolean,
        required: true,
        default: true
    },
    created : {
        type : String
    }
});

var Post = mongoose.model('Post', PostSchema);
module.exports = Post;
