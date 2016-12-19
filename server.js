var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

app.use('/q-compute', express.static(__dirname));

app.listen(8080);