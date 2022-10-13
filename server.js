const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const moment = require("moment");
//데이터베이스의 데이터 입력, 출력을 위한 함수명령어 불러들이는 작업
const app = express();
const port = 8080;

//ejs 태그를 사용하기 위한 세팅
app.set("view engine", "ejs");
//사용자가 입력한 데이터값을 주소로 통해서 전달되는 것을 변환(parsing)
app.use(express.urlencoded({ extended: true }));
//css/img/js를 사용하기 위한 코드
app.use(express.static("public"));

//데이터베이스 연결작업

let db; //데이터베이스 연결을 위한 변수세팅
MongoClient.connect(
  "mongodb+srv://admin:Qwe3834poi^(@testdb.d3uk0xi.mongodb.net/?retryWrites=true&w=majority",
  function (err, result) {
    //에러가 발생했을경우 메세지 출력(선택사항)
    if (err) return console.log(err);

    //위에서 만든 db변수에 최종연결 ()안에는 mongodb atlas 사이트에서 생성한 데이터베이스 이름
    db = result.db("testdb");

    //db연결이 제대로 되었다면 서버실행
    app.listen(port, function () {
      console.log("서버연결 성공");
    });
  }
);

//get요청-> a태그나 주소창에 기입한 url /
//post요청-> 폼태그에서 입력시 요청 req 응답 res
// app.get("/", function () {
//res.send("메세지");
//res.sendFile(__dirname + "/index.html");
//res.sendFile(__dirname + "/public/index.html");
//res.render("ejs파일명");
//res.redirect("/원하는경로명");
//하나의 요청에 응답은 한번만
// });

//게시글 작성페이지 경로 요청
app.get("/insert", function (req, res) {
  res.render("brd_insert");
});

let date = moment().format("YYYY-MM-DD HH:MM:SS");

app.post("/add", function (req, res) {
  db.collection("ex6_count").findOne(
    { name: "문의게시판" },
    function (err, result) {
      db.collection("ex6_board").insertOne(
        {
          brdid: result.totalCount + 1,
          brdtitle: req.body.title,
          brdcontext: req.body.context,
          brdauthor: req.body.author,
          brddate: date,
          brdviews: 0,
        },
        function (err, result) {
          db.collection("ex6_count").updateOne(
            { name: "문의게시판" },
            { $inc: { totalCount: 1 } },
            function (err, result) {
              res.redirect("/list"); // 목록페이지로 이동 -> 변경예정
            }
          );
        }
      );
    }
  );
});

app.get("/list", function (req, res) {
  //데이터베이스에서 게시글관련 데이터들 꺼내서 갖고온후 brd_list.ejs 전달
  db.collection("ex6_board")
    .find()
    .toArray(function (err, result) {
      res.render("brd_list", { data: result });
    });
});

//url parameter 주소에 데이터값을 실어서 보내는 요청방법
//get요청시 :변수명 <-- 작명
app.get("/detail/:no", function (req, res) {
  //req.params.no <-- 변수명 위에꺼랑 똑같이 작성
  //주소창을 통해서 보내는 데이터값이나 폼태그에서 입력한 데이터값들은 전부 String
  //게시글이 있는 콜렉션에 게시글번호값은 정수데이터라 데이터 유형을 매칭해야함
  db.collection("ex6_board").updateOne(
    { brdid: Number(req.params.no) },
    { $inc: { brdviews: 1 } },
    function (err, result) {
      db.collection("ex6_board").findOne(
        { brdid: Number(req.params.no) },
        function (err, result) {
          res.render("brd_detail", { data: result });
        }
      );
    }
  );
});

//수정 경로로 요청했을 경우 /uptview -> 수정하는 화면페이지를 응답
app.get("/uptview/:no", function (req, res) {
  db.collection("ex6_board").findOne(
    { brdid: Number(req.params.no) },
    function (err, result) {
      res.render("brd_uptview", { data: result });
    }
  );
});

//수정을 끝내고 /update 경로로 요청하면 내가 수정한 데이터들로 변경
app.post("/update", function (req, res) {
  db.collection("ex6_board").updateOne(
    {
      brdid: Number(req.body.id),
    },
    {
      $set: {
        brdtitle: req.body.title,
        brdcontext: req.body.context,
        brdauthor: req.body.author,
      },
    },
    function (err, result) {
      res.redirect("/detail/" + req.body.id);
      //uptview에 저장된 id값을 가진 /detail로 이동
    }
  );
});

// /delete/ 게시글번호로 요청했다면
app.get("/delete/:no", function (req, res) {
  //데이터베이스에 접근해서 ex6_board에 해당 게시글번호에 객체만 지우자.
  db.collection("ex6_board").deleteOne(
    { brdid: Number(req.params.no) },
    function (err, result) {
      res.redirect("/list"); //데이터 삭제후 게시글 목록페이지로 이동
    }
  );
});
