let ROOT_URL = 'https://chat24h.net/';
var socket = io(ROOT_URL);
var yourName = "";

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

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var hour = a.getHours();
    var min = a.getMinutes();
    var time =  hour + ':' + min 
    return time;
  }


function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function deleteCookie() {
    var conf = confirm("Bạn có chắc chắn muốn dừng chát ?");
    if(conf) {
        var cname = cookieName; 
        var d = new Date(); 
        d.setTime(d.getTime() - (1000*60*60*24)); 
        var expires = "expires=" + d.toGMTString(); 
        window.document.cookie = cname+"="+"; "+expires;
        socket.emit("CLIENT_KET_THUC_CHAT");
    } else {
        return false;
    }
}

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

function scrollChat() {
    setTimeout(
        function(){                        
            $("div.list-message-09021990").scrollTop($("div.list-message-09021990").prop('scrollHeight'));
        }, 0);
}

function isValidPhonenumber(p) {
  var phoneRe = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  var digits = p.replace(/\D/g, "");
  return phoneRe.test(digits);
}


function startActionChat() {
    var phone = $("#start_chat_form input[name=yourname]").val();
    if(!isValidPhonenumber(phone)) {
        alert('Bạn nhập không phải là số điện thoại');
        return false;
    }
    var data = {
        yourname : $("#start_chat_form input[name=yourname]").val(),
        user_id : rootUserId,
        status : true,
        hostname : $("#start_chat_form input[name=currentUrl]").val(),
        created : new Date().getTime()
    };
    socket.emit('ACTION_CREATE_ROOM_CHAT', data);
    $("#start_chat_form input[name=yourname]").val('');
    return false;
}

socket.on("CLIENT_START_CHAT", function(data) {
    $("#roomid").val(data.roomInfo.roomId);
    setCookie(cookieName, JSON.stringify(data.roomInfo), 1);
    yourName = data.roomInfo.yourname;
    $("form#start_chat_form").hide();
    $("#message-09021990").focus();
    playSound();
    socket.emit('CLIENT_SEND_DATA_MESSAGE',
        {
            message : 'Chào admin, vui lòng giúp đỡ tôi ',
            room : data.roomInfo.roomId,
            yourName : data.roomInfo.yourname,
            isAdmin : false,
            time : Math.floor(Date.now() / 1000)
        }
    );
    $("#identityfine").removeAttr('style');
});

socket.on("SERVER_THONG_BAO_KET_THUC_CHAT_THANH_CONG", function() {
    $(".identityfine").html('');
});


socket.on('SERVER_SEND_MESSAGE_TO_CLIENT', function(item) {
    var overClass = 'khach';
    if(item.isAdmin) {
        overClass = 'admin';
    }
    var html = '<div class="'+ overClass +'">';
        html += '<img src="/' + overClass+'.png" alt="" class="img">';
        html += item.message + '<br>';
        html += '<span>✓ Đã gửi lúc '+ timeConverter(item.time) +'</span>';
        html += '</div>';
    $("#identityfine").append(html);
    scrollChat();

    if (!tabActiveStatus) {
        playSound();
        $("#chat-area-09021990").removeClass('highlight');
    }
});



function onSubmitForm() {
    var message = $("input#message-09021990").val();
    let roomId = $("input#roomid").val();
    if(!yourName || !roomId) {
        var roomName = $("input[name=yourname]").val();
        if (roomName){
            startActionChat();
            return false;
        }
        alert('Vui lòng nhập số điện thoại');
        $("#start_chat_form input[name=yourname]").focus();
        return false;
    }
    if(!message.trim()) {
        return false;
    }
    if (message.length > 200) {
        alert("Nhập quá 200 ký tự");
        return false;
    }
    socket.emit('CLIENT_SEND_DATA_MESSAGE', 
            {
                message : $("input#message-09021990").val(),
                room : roomId,
                yourName : yourName,
                isAdmin : false,
                time : Math.floor(Date.now() / 1000)
            }
        );
    $("input#message-09021990").val('').focus();
    return false;
}


function checkEixtsUser() {
    if(device == 'mobile' && mobileTab != 'mobile'){
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            var url = 'https://chat24h.net/client/'+ rootUserId +'?url='+ currentUrl +'&domain='+ cookieName + '&device=mobile&tab=mobile';
            window.open(url, '_blank');
        }
    }

    let storedChat = getCookie(cookieName);
    if(storedChat) {
        $("form#start_chat_form").hide();
        checkUserChatingStatus();
    } else {
        $("form#start_chat_form").show();
    }
}

function checkUserChatingStatus() {
    let storedChat = getCookie(cookieName);
    var clientdata = JSON.parse(storedChat);
    yourName = clientdata.yourname;
    $("#roomid").val(clientdata.roomId);
    socket.emit('USER_COME_BACK', clientdata);
    socket.on("SERVER_SEND_OLD_MESSAGE", function(messages) {
        $("#identityfine").html("");
        messages.map((item)=> {
            var overClass = 'khach';
            if(item.isAdmin) {
                overClass = 'admin';
            }
            var html = '<div class="'+ overClass +'">';
                html += '<img src="/' + overClass+'.png" alt="" class="img">';
                html += item.message + '<br>';
                html += '<span>✓ Đã gửi lúc '+ timeConverter(item.time) +'</span>';
                html += '</div>';
            $("#identityfine").append(html);
            scrollChat();
        });
    });
    
}
socket.on("DELETE_ROOM_DONE", function () {
    eraseCookieFromAllPaths(cookieName);
    var html = '<div class="admin color-red">';
        html += '<img src="/admin.png" alt="" class="img">';
        html += 'Cuộc nói chuyện đã kết thúc. Tải lại trang để thực hiện lại.<br>';
        html += '<span>✓ Đã gửi từ hệ thống </span>';
        html += '</div>';
    $("#identityfine").append(html);
    scrollChat();
});

function eraseCookieFromAllPaths(name) {
    // This function will attempt to remove a cookie from all paths.
    var pathBits = location.pathname.split('/');
    var pathCurrent = ' path=';

    // do a simple pathless delete first.
    document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;';

    for (var i = 0; i < pathBits.length; i++) {
        pathCurrent += ((pathCurrent.substr(-1) != '/') ? '/' : '') + pathBits[i];
        document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;' + pathCurrent + ';';
    }
}

socket.on("room_da_bi_xoa", function (){
    eraseCookieFromAllPaths(cookieName);
    var html = '<div class="admin color-red">';
        html += '<img src="/admin.png" alt="" class="img">';
        html += 'Cuộc nói chuyện đã kết thúc. Tải lại trang để thực hiện lại.<br>';
        html += '<span>✓ Đã gửi từ hệ thống </span>';
        html += '</div>';
    $("#identityfine").append(html);
    scrollChat();
});
function hiClient() {
    setTimeout(function (){
        var html = '<div class="admin">';
            html += '<img src="/admin.png" alt="" class="img">';
            html += message1 + '<br>';
            html += '<span>✓ Đã gửi lúc '+ timeConverter(Math.floor(Date.now() / 1000)) +' </span>';
            html += '</div>';
        $("#identityfine").append(html).css({'padding-bottom': '45px'});
        scrollChat();
        playSound();
        setTimeout(function (){
            var html = '<div class="admin">';
                html += '<img src="/admin.png" alt="" class="img">';
                html += message2 + '<br>';
                html += '<span>✓ Đã gửi lúc '+ timeConverter(Math.floor(Date.now() / 1000)) +' </span>';
                html += '</div>';
            $("#identityfine").append(html).css({'padding-bottom': '45px'});
            scrollChat();
            playSound();
        },4000);
    },10000);
    
}
$(document).ready(function(){
    let storedChat = getCookie(cookieName);
    if(storedChat) {
        $("form#start_chat_form").hide();
        checkUserChatingStatus();
    } else {
//        $("form#start_chat_form").show();
        hiClient();
    }
});