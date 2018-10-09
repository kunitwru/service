var mongoose = require('mongoose');

var RoomSchema = new mongoose.Schema({
    yourname: {
        type: String,
        required: true,
        trim: true
    },
    user_id : {
        type: String,
        required: false
    },
    status : {
        type: Boolean,
        required: true,
        default : true
    },
    created : {
        type : String
    }
});

var Room = mongoose.model('Room', RoomSchema);
module.exports = Room;
