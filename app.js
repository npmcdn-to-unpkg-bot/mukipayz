'use strict';

//env
require('dotenv').config();

//main app
var express = require('express'),
    app = express(),
    logger = require('morgan');

//required routes
var routes = {
    dwolla: require('./payments/dwolla_auth'),
    index: require('./routes/index')
};

//app middleware
app.use(logger('dev'));
app.use(express.static(__dirname+'/public'));


//routes middleware
app.use('/', routes.landing);

// app.use('/auth', routes.auth);
app.use('/auth/dwolla', routes.dwolla);


const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("listening on", port);
    console.log("All other groups ain't got nuthin' on mukipayz!");
});
