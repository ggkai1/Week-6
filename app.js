let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;


const url = "mongodb://localhost:27017/";

let db;


MongoClient.connect(url, { useNewUrlParser: true },
    function (err, client) {
        if (err) {
            console.log("Err  ", err);
        } else {
            console.log("Connected successfully to server");
            db = client.db("fit2095tabe");
        }
});

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.use(express.static('images'));
app.use(express.static('css'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function (req, res) {
    res.render('index.html');
});

app.get('/addtasks', function (req, res) {
    res.render('addtasks.html'); 
});

app.post('/newtask', function (req, res) {
    let taskdetails = req.body;
    taskdetails.taskId = Math.floor(100000 + Math.random() * 900000);
    taskdetails.taskstatus = "InProgress"
    
    db.collection('tasks').insertOne({ 
        id: taskdetails.taskId, 
        name: taskdetails.taskname, 
        assignto: taskdetails.taskassigned, 
        due: new Date(taskdetails.taskdue),
        status: taskdetails.taskstatus,
        description: taskdetails.taskdesc 
    });
    res.redirect('listtasks');
});

app.get('/listtasks', function (req, res) {
    db.collection('tasks').find({}).toArray(function (err, data) {
        res.render('listtasks', { taskdb: data });
    });
});

app.get('/deletetask', function (req, res) {
    res.render('deletetask.html');
});


app.post('/deletetaskdata', function (req, res) {
    let taskdetails = req.body;
    let filter = { id: parseInt(taskdetails.taskId) };
    db.collection('tasks').deleteOne(filter);
    res.redirect('listtasks'); 
});

app.post('/deletealltasks', function (req, res) {
    db.collection('tasks').deleteMany({status: 'Completed'});
    res.redirect('listtasks');
});

app.get('/updatetask', function (req, res) {
    res.render('updatetask.html');
});

app.post('/updatetaskdata', function (req, res) {
    let taskdetails = req.body;
    let filter = { id: parseInt(taskdetails.taskId) };
    let update = { $set: { status: 'Completed' } };
    db.collection('tasks').updateOne(filter, update);
    res.redirect('/listtasks');
});


app.post('/updatecompletedtask', function (req, res) {
    let taskdetails = req.body;
    let filter = { id: parseInt(taskdetails.taskId) };
    let update = { $set: { status: 'InProgress' } };
    db.collection('tasks').updateOne(filter, update);
    res.redirect('/listtasks');
});

app.listen(8080);


