
var socket=io();

socket.on('alert', function(data){
   alert("invalid account!");
});


socket.on('login_alert', function(data){
   alert("로그인이 필요합니다!");
});


socket.on('submit_alert', function(data){
   alert("게시물이 등록되었습니다");
});

socket.on('curcost_alert', function(data){
   alert("현재 입찰가격보다 높은가격으로만 입찰이 가능합니다. ");
});

socket.on('mincost_alert', function(data){
   alert("현재 입력하신 가격이 최소 입찰가격보다 낮습니다. 다시 입력해주세요! ");
});

socket.on('maxcost_alert', function(data){
   alert("현재 입력하신 가격이 최대 입찰가격보다 높습니다. 즉시 구매를 이용해 주세요 ^^ ");
});
socket.on('buyitnow_alert', function(data){
   alert("선택하신 도서를 즉시 구매합니다! ");
});