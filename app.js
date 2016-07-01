'use strict';

//env
require('dotenv').config();

//main app
var express = require('express'),
    app = express(),
    logger = require('morgan'),
    path = require('path');

//setup views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//required routes
var routes = {
    dwolla: require('./payments/dwolla_auth'),
    index: require('./routes/index')
};

//app middleware
app.use(logger('dev'));
app.use(express.static(__dirname+'/public'));


//routes middleware
app.use('/', routes.index);


// app.use('/auth', routes.auth);
app.use('/auth/dwolla', routes.dwolla);


const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("listening on", port);
    console.log("All other groups ain't got nuthin' on mukipayz!");
});
