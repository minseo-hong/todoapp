const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

var db;

const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://admin:alstj2003@cluster0.6njwx.mongodb.net/todoapp?retryWrites=true&w=majority',
  function(error, client) {
    if (error) return console.log(error)

    db = client.db('todoapp');

    app.listen(8080, function() {
      console.log('Listening on 8080')
    });
  }
);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
});

app.get('/write', function(req, res) {
  res.sendFile(__dirname + '/write.html')
});

app.post('/add', function(req, res) {
  db.collection('counter').findOne({ name: '게시물 갯수' }, function(error, result) {
    // console.log(result.totalPost);
    var totalPostCount = result.totalPost;
    db.collection('post').insertOne(
      { _id: totalPostCount + 1, title: req.body.title, date: req.body.date },
      function(error, result) {
        console.log('저장 완료');
        db.collection('counter').updateOne(
          { name: '게시물 갯수' },
          { $inc : { totalPost: 1 } },
          function(error, result){
            if (error) return console.log(error)
            res.redirect('/list');
          }
        )
      }
    );
  });
});

app.get('/list', function(req, res) {
  db.collection('post').find().toArray(function(error, result) {
    // console.log(result);
    res.render('list.ejs', { posts: result });
  });
});

app.delete('/delete', function(req, res) {
  // console.log(req.body);
  req.body._id = parseInt(req.body._id);
  db.collection('post').deleteOne(req.body, function(error, result) {
    console.log('삭제 완료');
    res.status(200).send({ message: '성공했습니다' });
  })
})