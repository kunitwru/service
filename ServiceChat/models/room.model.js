var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RoomSchema = new Schema({
    yourname : String,
    yournIp : String,
    user_id : String,
    room_name : String,
    created : Number
});

module.exports = mongoose.model('rooms', RoomSchema);
