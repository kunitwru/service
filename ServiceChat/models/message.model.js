var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    message: String,
    yourName: String,
    isAdmin : Boolean,
    time: Number,
    room: {type: Schema.Types.ObjectId, ref: "Room", require: true},
});

module.exports = mongoose.model('Message', MessageSchema);
