/**
 * Created by admin on 2016-12-05.
 */
var socket=io();

function initChat(){
    socket.emit("listInit");
}

socket.on('myChatList', function(data){
    console.log(data);
    for( var row in data.buyList){
        $('#buyList').append('<li><a href=\"/chat?a='+ data.buyList[row].Auction_id +'\">'+ data.buyList[row].Title +'</a><label>'+data.buyList[row].Status+'</label></li>');
    }
    for( var row in data.sellList){
        $('#sellList').append('<li><a href=\"/chat?a='+ data.sellList[row].Auction_id +'\">'+ data.sellList[row].Title +'</a><label>'+data.sellList[row].Status+'</label></li>');
    }
});

window.onload = initChat;