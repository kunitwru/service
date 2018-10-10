var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RoomSchema = new Schema({
    yourname : String,
    user_id : String,
    created : Number,
    status : Boolean,
    hostname : String,
    messages : [{ type: Schema.Types.ObjectId, ref: 'Message' }]
});

module.exports = mongoose.model('Room', RoomSchema);
