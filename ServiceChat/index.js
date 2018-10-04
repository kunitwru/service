var express = require('express');
const mongooseDB = require('mongoose')
var app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views")

const helper = require('./helper/helper')

var server = require('http').Server(app);
var io = require("socket.io")(server);
server.listen(3000);

// mongoose
mongooseDB.Promise = global.Promise;
mongooseDB.connect('mongodb://localhost/pdb', { useNewUrlParser: true });
// include models
const messageModel = require('./models/message.model');
const roomModel = require('./models/room.model');

io.on("connection", function(socket) {
    socket.on("ACTION_CREATE_ROOM_CHAT", function(dataRoom) {
        roomModel.create(dataRoom)
            .then((res) => {
                dataRoom.roomId = res._id;
                socket.emit("CLIENT_START_CHAT", {'roomInfo': dataRoom ,'msg':'Xin chào <b>' + dataRoom.yourname +'</b>, bạn có thể bắt đầu chát'});
                socket.roomChat = dataRoom.roomChat;
                socket.join(dataRoom.roomChat);
            })
            .catch((err) => console.log("error action"))
    })

    socket.on("USER_COME_BACK", function(dataRoom) {
        socket.roomChat = dataRoom.roomId;
        socket.join(dataRoom.roomId);
        // get all data message
        messageModel.find({room:socket.roomChat})
            .exec()
            .then((messages) => {
                io.to(socket.roomChat).emit("SERVER_SEND_OLD_MESSAGE", messages);
            })
            .catch((err) => {
                console.log(err)
            });
    })
    socket.on("CLIENT_SEND_DATA_MESSAGE", function(data){
        roomModel.findOne({_id:data.room})
            .exec (function(err, room){
                if(err) return res.send(err);
                messageModel.create(data)
                .then((message) => {
                    room.messages.push(message);
                    room.save(function(err) {
                        io.to(socket.roomChat).emit('SERVER_SEND_MESSAGE_TO_CLIENT', message);
                    });
                    
                })
                .catch((err) => console.log(err))

        });
    });
    // kết thúc chát và update status room
    socket.on("CLIENT_KET_THUC_CHAT", function() {
        roomModel.updateOne({room_name : socket.roomChat}, {$set : {status : false}})
        .exec()
        .then((result) => {
            socket.emit("SERVER_THONG_BAO_KET_THUC_CHAT_THANH_CONG")
        })
        .catch(err =>  console.log(err));
    })

    // server send list room
    socket.on("CLIENT_SEND_USER_ADMIN_INFO", function(userInfo) {
        roomModel.find({user_id:userInfo.userId})
            .sort( { status: -1, created : -1 } )
            .populate('messages')
            .exec()
            .then(rooms => {
                socket.emit("SERVER_SEND_ROOM_LIST_TO_USER", rooms);
            })
            .catch(err => console.log(err));
    });
   
    // agent đăng ký join room (chuyển room)
    socket.on("AGENT_XAC_NHAN_JOIN_ROOM", function(roomId) {
        socket.join(roomId);
        socket.roomChat = roomId;
        // get all data message
        messageModel.find({room:roomId})
            .exec()
            .then((messages) => {
                io.to(roomId).emit("SERVER_SEND_OLD_MESSAGE", messages);
            })
            .catch((err) => {
                console.log(err)
            });
    })
})

// router index
app.get("/",function(req, res){
    res.render("home");
})