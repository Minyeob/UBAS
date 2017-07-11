var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password: '12345',
  database : 'auction'
});



/* GET home page. */
router.get('/', function(req, res, next) {

  console.log("/ :"+JSON.stringify(req.session));
  if(req.session.loginId ==null)
  res.render('index', { login: '로그인' });
  else
    res.render('index', { login: '로그아웃' , userid : JSON.stringify(req.session.name)+'님 안녕하세요'  });
});
router.get('/examples.jade', function(req, res, next) {
  console.log("examples :"+JSON.stringify(req.session));
  if(req.session.loginId ==null)
    res.render('example', { login: '로그인' });
  else
    res.render('example', { login: '로그아웃' ,userid : JSON.stringify(req.session.name)+'님 안녕하세요'  });
});
router.get('/index.jade', function(req, res, next) {
  console.log("index.jade : "+JSON.stringify(req.session));
  if(req.session.loginId ==null)
    res.render('index', { login: '로그인' });
  else
    res.render('index', { login: '로그아웃' , userid : JSON.stringify(req.session.name)+'님 안녕하세요' });
});

router.get('/page.jade', function(req, res, next) {
  console.log("page"+req.session.loginId);
  res.render('page', { title: 'Express' });
});

router.get('/another_page.jade', function(req, res, next) {
  res.render('another_page', { title: 'Express' });
});

router.get('/contact.jade', function(req, res, next) {
  res.render('contact', { title: 'Express' });
});





/*
router.get('/resister' , function(req,res,next){
  connection.connect();

  var sql ='SELECT * FROM auction';
  connection.query(sql,function(err,rows,fields){
    if(err){
      console.log(err);
    }
    else{
      console.log('rows',rows);
      console.log('fields',fields);
    }
  });

  var sql = 'INSERT INTO auction (Title , Content ) VALUES("Nodejs","Server side javascript")';
  connection.query(sql,function(err,rows,fields) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(rows);

    }
  });
  coonnection.end();
});
*/

module.exports = router;
