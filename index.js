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
                socket.emit("CLIENT_START_CHAT", 'Xin chào <b>' + dataRoom.yourname +'</b>, bạn có thể bắt đầu chát');
                socket.roomChat = dataRoom.roomChat;
                socket.join(dataRoom.roomChat);
            })
            .catch((err) => console.log("error action"))
    })
    socket.on("USER_COME_BACK", function(dataRoom) {
        socket.roomChat = dataRoom.room_name;
        socket.join(dataRoom.room_name);
        // get all data message
        messageModel.find({yourRoom:socket.roomChat})
            .exec()
            .then((messages) => {
                io.to(socket.roomChat).emit("SERVER_SEND_OLD_MESSAGE", messages);
            })
            .catch((err) => {
                console.log(err)
            })
    })
    socket.on("CLIENT_SEND_DATA_MESSAGE", function(data){
        messageModel.create(data)
        .then((message) => {
            io.to(socket.roomChat).emit('SERVER_SEND_MESSAGE_TO_CLIENT', message);
        })
        .catch((err) => console.log(err))
    });
    
})


// router index
app.get("/",function(req, res){
    res.render("home");
})
