var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
//var MySQLStore = require('express-mysql-session')(session);
var mysql = require('mysql');
var index = require('./routes/index');
var users = require('./routes/users');
var register = require('./routes/register');
var login = require('./routes/login');
var logout = require('./routes/logout');
var topic = require('./routes/topic');
var report = require('./routes/report');
var auctionChat = require('./routes/auctionChat');
var chatList = require('./routes/chatList');
var check_flag=0;

var app = express();
var io = require('socket.io')();
app.io = io;


var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  database: 'auction',
  password: '12345'
});

var sessionMiddle = session({
  secret: 'session key',
  resave: false,
  saveUninitialized: false
});

app.use(function(req,res,next){
  if(check_flag==0){

    var no_buyer_event= "create event IF NOT EXISTS No_Buyer ON SCHEDULE EVERY 1 MINUTE STARTS CURRENT_TIMESTAMP + INTERVAL 1 MINUTE DO UPDATE auction set Status='입찰없음' WHERE Start_time < CURRENT_TIMESTAMP + INTERVAL -15 HOUR AND Buyer_id is NULL;"

    var time_expire_event ="create event IF NOT EXISTS Time_Expire ON SCHEDULE EVERY 1 MINUTE STARTS CURRENT_TIMESTAMP + INTERVAL 1 MINUTE DO UPDATE auction set Status='거래중' WHERE Start_time < CURRENT_TIMESTAMP + INTERVAL -10 MINUTE AND Buyer_id is NOT NULL;"

    var exit_event="create event IF NOT EXISTS Exit_Event ON SCHEDULE EVERY 1 MINUTE STARTS CURRENT_TIMESTAMP + INTERVAL 1 MINUTE DO UPDATE auction set Status='거래종료' WHERE Start_time < CURRENT_TIMESTAMP + INTERVAL -15 MINUTE AND Buyer_id is NOT NULL;"

    var delete_event="create event IF NOT EXISTS Delete_Event ON SCHEDULE EVERY 1 MINUTE STARTS CURRENT_TIMESTAMP + INTERVAL 1 MINUTE DO Delete from auction  WHERE Start_time < CURRENT_TIMESTAMP + INTERVAL -3 DAY AND Status = '거래종료';"

    pool.getConnection(function (err, connection) {
      connection.query(no_buyer_event, function (err, rows) {
        if (err) console.error("err : " + err);
      });
      connection.query(time_expire_event, function (err, rows) {
        if (err) console.error("err : " + err);
      });
      connection.query(exit_event, function (err, rows) {
        if (err) console.error("err : " + err);
      });
      connection.query(delete_event, function (err, rows) {
        if (err) console.error("err : " + err);
      });
      connection.release();
    });
  }
  check_flag++;
  next();
});



app.io.use(function(socket, next){
  sessionMiddle(socket.request, socket.request.res, next);    //socket.io 내에서 세션 쓰기 위해 사용
});
app.use(sessionMiddle);
app.io.on('connection', function(socket){
  console.log("session:" + JSON.stringify(socket.request.session.loginId));

  console.log(socket.rooms);
 // socket.request.session.loginId = req.session.loginId; //test user login id
 // socket.request.session.save();
  console.log("socket login id : "+socket.request.session.loginId);
  socket.on('listInit', function(){
    if( socket.request.session.loginId) {
      pool.getConnection(function (err, connection) { //거래중인 물품에 대한 auction_id 전체 조회
        var totalRows={};
        connection.query('SELECT * FROM auction where  Seller_id = ? ', [ socket.request.session.loginId], function (err, rows) {
          if (err) console.error("err : " + err);
          console.log("rows : " + JSON.stringify(rows));
          totalRows.sellList=rows;
          connection.query('SELECT * FROM auction where Buyer_id = ? ', [ socket.request.session.loginId], function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));
            totalRows.buyList=rows;
            socket.emit('myChatList', totalRows); //구매자 판매자 정보 전달
            connection.release();
          });
        });
      });
    };
  });
  socket.on('joinChat', function(auctionId){
    if( auctionId && socket.request.session.loginId) {
      pool.getConnection(function (err, connection) { //채팅방 입장시 db에 저장되어있던 채팅기록 먼저 불러와서 출력
        connection.query('SELECT * FROM auction where Auction_id = ? AND Status = ? AND (Seller_id = ? OR Buyer_id = ?)', [auctionId, '거래중',socket.request.session.loginId, socket.request.session.loginId], function (err, rows) {
          if (err) console.error("err : " + err);

          if (rows.length != 0) {  //경매가 끝난 글에대한 구매자나 판매자가 자신일경우 해당되는 경매글이  있는경우id_bid(rows)
            socket.join(auctionId);             //구매자와 판매자만 채팅할수있는 곳(auction_id 기준)으로 join
            socket.emit('myChatLogInfo', rows); //구매자 판매자 정보 전달
            connection.query('SELECT *,  DATE_FORMAT(Created_time,"%T [%m/%d]") as Time_format FROM chat where Auction_id = ?', rows[0].Auction_id, function (err, rows) {
              if (err) console.error("err : " + err);
              console.log("rows : " + JSON.stringify(rows));
              socket.emit('myChatLog', rows);
              connection.release();
              // Don't use the connection here, it has been returned to the pool.
            });
          }
        });

      });
    };
  });


  socket.on('new message', function(msg, auctionId){
    if(auctionId && socket.request.session.loginId) {
      if (socket.rooms[auctionId]) {
        pool.getConnection(function (err, connection) {
          connection.query('SELECT * FROM auction where Auction_id = ? AND (Seller_id = ? OR Buyer_id = ?)', [auctionId, socket.request.session.loginId, socket.request.session.loginId], function (err, rows) {
            if (err) console.error("err : " + err);
            if (rows.length != 0) {  //경매가 끝난 글에대한 구매자나 판매자가 자신일경우 해당되는 경매글이  있는경우id_bid(rows)
              var user = {
                'Auction_id': auctionId,
                'Content': msg,
                'Writer_id': socket.request.session.loginId
              };
              connection.query('insert into chat set ?', user, function (err, rows) {
                if (err) console.error("err : " + err);
                connection.release();
                app.io.to(auctionId).emit('broadcast', msg);
                // Don't use the connection here, it has been returned to the pool.
              });
            }
          });
        });
      }
    }
  });

  socket.on('disconnect', function(){
    console.log('cli disconnected');
  });
});
/*
app.use(session({
    secret: '23423523r32fewfd@!!#@@#@fdd',
      resave : false,
      saveUninitialized : true,
      store: new MySQLStore({
      host: 'localhost',
      port: 3306,
      user:'root',
      password:'32166115',
      database:'auction'
  })
}));
*/
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('socketio', app.io);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/topic/add/:id', express.static(__dirname + '/public'));
app.use('/topic', express.static(__dirname + '/public'));


app.use(function(req,res,next){
  req.app.io=app.io;
  next();
});

app.use('/', index);
app.use('/users', users);
app.use('/register', register);
app.use('/login', login);
app.use('/logout', logout);
app.use('/topic', topic);
app.use('/chatlist', chatList);
app.use('/chat',auctionChat);
app.use('/report',report);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
