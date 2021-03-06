var express = require('express');
const mongooseDB = require('mongoose');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session');
var validator = require('express-validator');

var MongoStore = require('connect-mongo')(session);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views");



var server = require('http').Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT || 3000);

// mongoose
mongooseDB.Promise = global.Promise;
mongooseDB.connect('mongodb://localhost/pdb', {
    useNewUrlParser: true
});
var db = mongooseDB.connection;

//use sessions for tracking logins
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));


// include models
const messageModel = require('./models/message.model');
const roomModel = require('./models/room.model');
const userModel = require('./models/user.model');

io.on("connection", function (socket) {
    socket.on("ACTION_CREATE_ROOM_CHAT", function (dataRoom) {
        roomModel.create(dataRoom)
            .then((res) => {
                dataRoom.roomId = res._id;
                socket.emit("CLIENT_START_CHAT", {
                    'roomInfo': dataRoom,
                    'msg': 'Xin chào <b>' + dataRoom.yourname + '</b>, bạn có thể bắt đầu chát'
                });
                socket.roomChat = res._id;
                socket.join(res._id);
                io.sockets.emit("NEW_CLIENT_REQUEST");
            })
            .catch((err) => console.log("error action"));
    });

    socket.on("USER_COME_BACK", function (dataRoom) {
        socket.roomChat = dataRoom.roomId;
        socket.join(dataRoom.roomId);
        // get all data message
        roomModel.updateOne({
                 _id: socket.roomChat
             }, {
                 $set: {
                     status: true
                 }
             })
             .exec()
             .then((result) => {
                 io.sockets.emit("NEW_CLIENT_REQUEST");
                 socket.emit("SERVER_THONG_BAO_KET_THUC_CHAT_THANH_CONG");
             })
             .catch(err => console.log(err));
        
        messageModel.find({
                room: socket.roomChat
            })
            .exec()
            .then((messages) => {
                io.to(socket.roomChat).emit("SERVER_SEND_OLD_MESSAGE", messages);
            })
            .catch((err) => {
                console.log(err);
            });
    });
    
    socket.on("CLIENT_SEND_DATA_MESSAGE", function (data) {
        roomModel.findOne({
                _id: data.room
            })
            .exec(function (err, room) {
                if (err){
                    return console.log(err);
                }
                if (room == null) {
                    socket.emit("room_da_bi_xoa");
                    return false;
                }
                messageModel.create(data)
                    .then((message) => {
                        room.messages.push(message);
                        room.save(function (err) {
                            io.to(data.room).emit('SERVER_SEND_MESSAGE_TO_CLIENT', message);
                        });
                        io.sockets.emit("NEW_CLIENT_REQUEST");
                    })
                    .catch((err) => console.log(err));

            });
    });
    // kết thúc chát và update status room
    socket.on("CLIENT_KET_THUC_CHAT", function () {
        roomModel.updateOne({
                _id: socket.roomChat
            }, {
                $set: {
                    status: false
                }
            })
            .exec()
            .then((result) => {
                socket.emit("SERVER_THONG_BAO_KET_THUC_CHAT_THANH_CONG");
            })
            .catch(err => console.log(err));
    });



    // server send list room
    socket.on("CLIENT_SEND_USER_ADMIN_INFO", function (userInfo) {
        roomModel.find({
            user_id: userInfo.userId
        })
            .sort({
                status: -1,
                created: -1
            })
            .populate('messages')
            .exec()
            .then(rooms => {
                socket.emit("SERVER_SEND_ROOM_LIST_TO_USER", rooms);
            })
            .catch(err => console.log(err));

    });

    // agent đăng ký join room (chuyển room)
    socket.on("AGENT_XAC_NHAN_JOIN_ROOM", function (roomId) {
        socket.join(roomId);
        socket.roomChat = roomId;
        // get all data message
        messageModel.find({ room: roomId })
            .exec()
            .then((messages) => {
                io.to(roomId).emit("SERVER_SEND_OLD_MESSAGE", messages);
            })
            .catch((err) => {
                console.log(err);
            });
        // update room read_status
        roomModel.updateOne({ _id: socket.roomChat }, { $set: { read_status: false } })
            .exec()
            .then((result) => {
                console.log(result);
            })
            .catch(err => console.log(err));
    });



    socket.on("AGENT_ACTION_DELETE_ROOM", function (roomId) {
        roomModel.remove({_id:roomId})
            .exec((err, result) => {
                if (err) {
                    return console.log(err);
                }
                console.log("xin fhafo");
                io.to(roomId).emit("DELETE_ROOM_DONE");
            });
    });


    // user disconnect
     socket.on("disconnect", function () {
         roomModel.updateOne({
                 _id: socket.roomChat
             }, {
                 $set: {
                     status: false
                 }
             })
             .exec()
             .then((result) => {
                 io.sockets.emit("NEW_CLIENT_REQUEST");
                 socket.emit("SERVER_THONG_BAO_KET_THUC_CHAT_THANH_CONG");
             })
             .catch(err => console.log(err));
     });
});


// include routes
var routes = require('./routers/index');
var postrouter = require('./routers/post');
app.use('/', routes);
app.use('/post', postrouter);

