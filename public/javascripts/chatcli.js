var socket=io();

function chatInit(){
    var auctionId = $.getUrlVar('a');
    socket.emit('joinChat', auctionId);
}

function sendMessage(){
    console.log("send message");
    var msg = $('#chatmsg').val();
    var auctionId = $.getUrlVar('a');
    socket.emit("new message" , msg, auctionId);
    $('#chatmsg').val('');
    $('#chatmsg').focus();
}

socket.on('broadcast', function(data){
    $('#chatview').append(data+'<br>');
    autoScrollDown();
});

socket.on('myChatLog', function(data){
    var str;
    for( var row in data){
        str = data[row].Writer_id + ': ';
        str += data[row].Content + ' ';
        str += data[row].Time_format;
        $('#chatview').append(str+'<br>');
    }
    autoScrollDown();
});

socket.on('myChatLogInfo', function(data){
    var str;
    for( var row in data){
        str = '판매자: '+data[row].Seller_id + ' ';
        str += '구매자: ' + data[row].Buyer_id + ' ';
        $('#chatwho').append(str+'<br>');
    }
});

function autoScrollDown(){
    $('#chatview').scrollTop($('#chatview').height());
}

//url에서 get param 받기
$.extend({
    getUrlVars: function(){
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },
    getUrlVar: function(name) {
        return $.getUrlVars()[name];
    }
});

window.onload = chatInit;

