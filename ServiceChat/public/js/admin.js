const socket = io("https://chat24h.net");

var tabActiveStatus = 1;
$(window).focus(function() {
    if (!tabActiveStatus){
        tabActiveStatus = 1;
    }
});
$(window).blur(function() {
    clearInterval(tabActiveStatus);
    tabActiveStatus = 0;
});

function playSound() {
    var audio = new Audio('https://chat24h.net/notification.wav');
    audio.type = 'audio/wav';

    var playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise.then(function () {

        }).catch(function (error) {
            console.log('Failed to play....' + error);
        });
    }
}


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
        var activeclass = "";
        if (item._id == $("input[name=roomid]").val()) {
            activeclass = "active";
        }
        var html = '<li class="contact '+ activeclass +'" id="'+ item._id +'" onclick="joinRoom(\'' + item._id + '\', \'' + item.yourname + '\',  \'' + item.hostname + '\')">';
        html += '<div class="wrap">';
        html += '<span class="contact-status ' + status + '"></span>';
        html += '<img src="/khach.png" alt="" />';
        html += '<div class="meta">';
        html += '<p class="name">' + item.yourname + '<small>' + timeConverter(lastTime) + '<span class="new-icon"></span></small></p>';
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

function joinRoom(roomId, name, hostname) {
    socket.emit("AGENT_XAC_NHAN_JOIN_ROOM", roomId);
    $("#chatForm input[name=roomid]").val(roomId);
    $("#delete-room").html('<label class="btn btn-danger btn-sm btn-delete-room" roomId="'+ roomId +'"><i class="fa fa-trash-o"></i></label>');
    var roomName = '<span class="phone">'+name+'</span>';
    if (hostname != 'undefined') {
        roomName += '<small class="title-link">(' + hostname + ')</small>';
    }
    $("#userAgenName").html(roomName);
    socket.on("SERVER_SEND_OLD_MESSAGE", function (messages) {
        $(".messages ul").html("");
        messages.map((item) => {
            var overClass = 'replies';
            var avatar = 'khach';
            if (item.isAdmin == true) {
                overClass = "sent";
                avatar = 'admin';
            }
            var html = '<li class="' + overClass + '">';
            html += '<img src="/' + avatar + '.png" alt="">';
            html += '<p>' + item.message + '</p>';
            html += '</li>';
            $(".messages ul").append(html);
            scrollChat();
        });
    });
    $("#contacts ul li").removeClass("active");
    $('li#'+roomId).addClass("active");
    $("#chatForm input[name=message]").prop('disabled', false);
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
    var html = '<li class="' + overClass + '">';
    html += '<img src="/' + avatar + '.png" alt="">';
    html += '<p>' + item.message + '</p>';
    html += '</li>';
    $(".messages ul").append(html);
    scrollChat();
    
    if (!tabActiveStatus) {
        playSound();
    }
});


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

$("#delete-room").on('click', '.btn-delete-room', function (e) {
    var conf = confirm("Bạn chắc chắn muốn xóa ?");
    if (!conf) {
        console.log("fail");
        return false;
    }
    var roomId = $(this).attr("roomid");
    socket.emit("AGENT_ACTION_DELETE_ROOM", roomId);
});

socket.on("DELETE_ROOM_DONE", function () {
    $("#chatForm input[name=roomid]").val("");
    $("#delete-room").html('');
    $("#userAgenName").html('');
    $("div.messages ul").html('');
    $("#chatForm input[name=message]").html('').prop('disabled', true);
    reloadPage();
});