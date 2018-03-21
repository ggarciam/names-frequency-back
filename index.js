var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    routes = require('./server/routes/index');

// only use to generate names in name table from scratch
// var nameGen = require('./server/models/namesGen');

var freqGen = require('./server/models/frequenciesGen');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

console.log("Hola");
console.log(process.env);
console.log("Puerto");
console.log(process.env.PORT);

app.set('port', (process.env.PORT || 5000));

app.use('/', routes);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


