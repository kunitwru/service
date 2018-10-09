const socket = io("http://localhost:3000/");


function reloadPage() {
    // send user info
    socket.emit("CLIENT_SEND_USER_ADMIN_INFO", {
        userId: rootUserCode
    });
}
socket.on("NEW_CLIENT_REQUEST", function () {
    socket.emit("CLIENT_SEND_USER_ADMIN_INFO", {
        userId: rootUserCode
    });
})

function getLastElemet(array, n) {
    if (array == null) return void 0;
    if (n == null) return array[array.length - 1];
    return array.slice(Math.max(array.length - n, 0));
}


socket.on("SERVER_SEND_ROOM_LIST_TO_USER", function (rooms) {
    $("#contacts ul").html('');
    rooms.map(item => {
        var lastMessage = "";
        var lastTime = "";
        if (item.messages.length > 0) {
            var message = getLastElemet(item.messages);
            lastMessage = message.message;
            lastTime = message.time;
        }

        var status = '';
        if (item.status == true) {
            status = 'online';
        }
        var html = '<li class="contact" onclick="joinRoom(\'' + item._id + '\', \'' + item.yourname + '\')">';
        html += '<div class="wrap">';
        html += '<span class="contact-status ' + status + '"></span>';
        html += '<img src="http://uhthi.com:3000/khach.png" alt="" />';
        html += '<div class="meta">';
        html += '<p class="name">' + item.yourname + '<small>' + timeConverter(lastTime) + '</small></p>';
        html += '<p class="preview"><i>' + lastMessage + '</i></p>';
        html += '</div>';
        html += '</div>';
        html += '</li>';
        $("#contacts ul").append(html);
    })
});

function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var time = hour + ':' + min + '' + date + ' ' + month + ' ' + year;
    return time;
}

function joinRoom(roomId, name) {
    socket.emit("AGENT_XAC_NHAN_JOIN_ROOM", roomId);
    $("#chatForm input[name=roomid]").val(roomId);
    $("#userAgenName").text(name);
    socket.on("SERVER_SEND_OLD_MESSAGE", function (messages) {
        $(".messages ul").html("");
        messages.map((item) => {
            var overClass = 'replies';
            var avatar = 'khach';
            if (item.isAdmin == true) {
                overClass = "sent";
                avatar = 'admin';
            }
            var html = '<li class="' + overClass + '">'
            html += '<img src="http://uhthi.com:3000/' + avatar + '.png" alt="">';
            html += '<p>' + item.message + '</p>';
            html += '</li>';
            $(".messages ul").append(html);
            scrollChat();
        })
    })
}


function newMessage() {
    message = $(".message-input input[name=message]").val();
    if ($.trim(message) == '') {
        return false;
    }
    socket.emit('CLIENT_SEND_DATA_MESSAGE', {
        message: message,
        room: $("#chatForm input[name=roomid]").val(),
        yourName: "Admin",
        isAdmin: true,
        time: Math.floor(Date.now() / 1000)
    });
    $(".message-input input[name=message]").val('');
    scrollChat();
};
socket.on('SERVER_SEND_MESSAGE_TO_CLIENT', function (item) {
    var overClass = 'replies';
    var avatar = 'khach';
    if (item.isAdmin == true) {
        overClass = "sent";
        avatar = 'admin';
    }
    var html = '<li class="' + overClass + '">'
    html += '<img src="http://uhthi.com:3000/' + avatar + '.png" alt="">';
    html += '<p>' + item.message + '</p>';
    html += '</li>';
    $(".messages ul").append(html);
    scrollChat();
})


function scrollChat() {
    setTimeout(
        function () {
            $("div.messages").scrollTop($("div.messages").prop('scrollHeight'));
        }, 0);
}


$('.submit').click(function () {
    newMessage();
});

$(window).on('keydown', function (e) {
    if (e.which == 13) {
        newMessage();
        return false;
    }
});

$(".expand-button").click(function() {
    $("#profile").toggleClass("expanded");
      $("#contacts").toggleClass("expanded");
  });