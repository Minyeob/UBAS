/**
 * Created by Minye0b on 2016-12-06.
 */
var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'auction',
    password: '12345'
});

// report에 get으로 접속하면 상대방을 신고할 수 있는 폼을 보여준다.
router.get('/', function (req, res, next) {
    console.log('session id is ' +req.session.loginId);
    if(req.session.loginId ==null)
        res.render('report', { login: '로그인' });
    else
        res.render('report', { login: '로그아웃' , userid : JSON.stringify(req.session.name)+'님 안녕하세요'  });

})

// report 페이지에서 신고할 상대방 아이디를 입력후 신고 버튼을 누르면 입력한 신고 대상 아이디가 존재하는지 검색한다.
//상대방 아이디가 존재한다면 현재 아이디로 상대방을 신고한 적이 있는지 확인한 후 신고한 적이 없다면 상대방 아이디에 신고 카운트를 1 증가시킨다.
// 상대방 아이디가 존재하지 않는다면 아이디가 존재하지 않는다는 alert를 띄워준다.

router.post('/', function (req, res, next) {
    var opposite=JSON.stringify(req.body.report_id);
    pool.getConnection(function (err, connection) {
        //상대방이 데이터베이스에 존재하는 아이디인지 데이터베이스에서 검색한다.
        var find_query = "SELECT * FROM user WHERE User_id=" + opposite;
        connection.query(find_query, function (err, rows){
            //상대방의 아이디가 존재하는 경우
            if(rows[0])
            {
                var count = rows[0].Report_count;
                //상대방을 이전에 신고한적이 있는지 여부를 나타내는 변수 pre_report
                var pre_report = false;
                //현재 사용자의 아이디로 상대방을 신고한적이 있는지 검색
                var check_query = "SELECT opposite FROM report WHERE reporter=" + req.session.loginId;
                connection.query(check_query, function (err, rows)
                {
                    rows.forEach(function (row)
                    {
                        //상대방을 신고한 적이 있는 경우
                        if(JSON.stringify(row.opposite)==opposite)
                        {
                            pre_report=true;
                            //해당 ID를 이미 신고한적이 있다고 알리고 다시 신고페이지를 나타낸다.
                            res.render('report', {message:'해당 ID를 중복해서 신고할 수 없습니다', 
                                alert:'<script type="text/javascript">alert("해당 ID를 이미 신고하셨습니다");</script>',
                                login: '로그아웃' , userid : JSON.stringify(req.session.name)+'님 안녕하세요'});
                        }
                    })

                    //상대방을 신고한 적이 없는 경우
                    if(pre_report==false)
                    {
                        count = count * 1 + 1;
                        //신고당한 상대의 신고 카운트를 1 증가시키는 쿼리문
                        var update_query = "UPDATE user SET Report_count=" + count + " WHERE id=" + opposite;
                        console.log(update_query);
                        connection.query(update_query, function (err, rows)
                        {
                            //현재 사용자가 상대방을 신고했다는것을 데이터베이스에 저장하기 위한 쿼리문
                            var insert_query = "INSERT INTO report VALUES (" + req.session.loginId + "," + opposite + ")";
                            connection.query(insert_query, function (err, rows)
                            {
                                //정상적으로 신고가 처리되었음을 알리고 다시 신고페이지를 나타낸다
                                res.render('report', {message:'해당 사용자를 정상적으로 신고하였습니다',
                                    alert:'<script type="text/javascript">alert("정상적으로 신고 되었습니다");</script>',
                                    login: '로그아웃' , userid : JSON.stringify(req.session.name)+'님 안녕하세요'});
                                connection.release();
                            })
                        })
                    }
                })
            }

            //상대방의 아이디가 없는 경우
            else
            {
                //해당 ID는 등록되지 않은 ID라고 알려준후, 다시 신고페이지를 나타낸다.
                res.render('report', {message:'올바른 ID를 입력해주세요',
                    alert:'<script type="text/javascript">alert("해당 ID는 존재하지 않습니다")</script>',
                    login: '로그아웃' , userid : JSON.stringify(req.session.name)+'님 안녕하세요'});
            }
        })
    })
})

module.exports = router;