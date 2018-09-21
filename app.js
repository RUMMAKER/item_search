var express = require('express');
var app = express();
app.get('/', (req, res) => {res.sendFile(__dirname + '/public/index.html')});
app.use('/', express.static('public'))
var PORT = process.env.PORT || 3000;
var server = app.listen(PORT, () => {console.log("Server started on port 3000 ...")});