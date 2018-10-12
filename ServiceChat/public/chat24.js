function getuhchatCookie(c_name){
    var c_value=document.cookie;
    var c_start=c_value.indexOf(" "+c_name + "=");
    if(c_start == -1){
        c_start=c_value.indexOf(c_name+"=");
    }
    if(c_start == -1){
        c_value=null;
    }else{
        c_start=c_value.indexOf("=", c_start)+1;
        var c_end=c_value.indexOf(";",c_start);
        if(c_end == -1){
            c_end=c_value.length;
        }
        c_value=unescape(c_value.substring(c_start,c_end));
    }
    return c_value;
}
function setuhchatCookie(c_name,value,exdays){
    var exdate=new Date();exdate.setDate(exdate.getDate()+exdays);
    var c_value=escape(value)+((exdays == null)?"":";expires="+exdate.toUTCString()+";path=/");
    document.cookie=c_name+"="+c_value;
}

function chat24hClick(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        var url = 'https://chat24h.net/client/'+ $("#chat24h").attr("data-user-id") +'?url='+ window.location.href +'&domain='+ window.location.hostname + '&device=mobile';
        window.open(url, '_blank');
     }
    
    if(getuhchatCookie("uhchatrelock")=="0"){
        document.getElementById("chat24h").style.bottom="-320px";
        setuhchatCookie("uhchatrelock","1",1);
    }else{
        document.getElementById("chat24h").style.bottom="0px";
        setuhchatCookie("uhchatrelock","0",1);
    }
}

$(document).ready(function () {
    var vitridau = -320;
    if(getuhchatCookie("uhchatrelock") == "0"){
        vitridau = 0;
        document.getElementById("chat24h").style.bottom = vitridau + "px";
    } else {
        if(getuhchatCookie("uhchatrelock") != "1"){
            setuhchatCookie("uhchatrelock","0",1);
            document.getElementById("chat24h").style.bottom = vitridau + "px";
        }
    }

    const userCode = $("#chat24h").attr("data-user-id");
    var html = '<style>#chat24h {width: 320px;height: 305px;border-bottom: 3px solid #0084ff;display: block;background: url("https://chat24h.net/chat-11.png") no-repeat;text-align: center;padding-top: 40px;position: fixed;bottom:-320px;right: 20px;z-index: 99999999999999; box-sizing: content-box;} #chat24h.highlight{bottom: 0px;}  #chat24h iframe{border:none;width:317px !important;padding-right: 2px !important;height:305px !important;margin:0px !important;position:relative !important;display: inline !important;} #chat24h:hover {cursor: pointer;} @media screen and (max-width: 320px){#chat24h{right: 0px !important;}} #panel_chat_vatgia{display:none !important;} .zopim{display:none !important;} .embed-responsive{padding-bottom:100% !important;} </style>';
        html += '<iframe id="iframeUhchat" frameborder="0" allowfullscreen src="https://chat24h.net/client/'+ userCode +'?url='+ window.location.href +'&domain='+ window.location.hostname +'&device=desktop" width="304px" height="305px" style="padding:0px;"></iframe>';
    $("#chat24h").html(html).attr('onclick','chat24hClick()');
});