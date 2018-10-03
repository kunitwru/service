var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    message: String,
    yourRoom: String,
    currentIP: String,
    yourName: String,
    isAdmin : Boolean,
    time: Number
});

module.exports = mongoose.model('message', MessageSchema);
