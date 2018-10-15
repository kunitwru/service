let mongoose = require('mongoose');

let MenuSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    contents: {
        type: String,
        default: null
    }
});

var Menu = mongoose.model('Menu', MenuSchema);
module.exports = Menu;
