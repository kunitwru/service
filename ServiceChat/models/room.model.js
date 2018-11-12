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
    hostname : {
        type: String,
        required: false
    },
    created : {
        type : String
    },
    messages : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

var Room = mongoose.model('Room', RoomSchema);
module.exports = Room;
