'use strict';

//env
require('dotenv').config();

//main app
var express = require('express'),
    app = express(),
    logger = require('morgan');

//required routes
var routes = {
    landing: require('./routes/landing')
};

//app middleware
app.use(logger('dev'));
app.use(express.static(__dirname+'/public'));


//routes middleware
app.use('/', routes.landing);

const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("listening on", port);
    console.log("All other groups ain't got nuthin' on mukipayz!");
});
