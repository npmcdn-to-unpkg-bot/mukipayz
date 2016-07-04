'use strict';

//env
require('dotenv').config();

//main app
var express = require('express'),
    app = express(),
    logger = require('morgan'),
    passport = require('passport'),
    cookieSession = require('cookie-session');

//required routes
var routes = {
    dwolla: require('./payments/dwolla_auth'),
    index: require('./routes/index')
};

//app middleware
app.use(logger('dev'));
app.use(express.static(__dirname+'/public'));
app.use(cookieSession({
    name: 'mukipayz',
    keys: [
        process.env.SECRET_ONE,
        process.env.SECRET_TWO
    ]
}));
app.use(passport.initialize());
app.use(passport.session());

//routes middleware
app.use('/', routes.index);

// app.use('/auth', routes.auth);
app.use('/auth/dwolla', routes.dwolla);


const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("listening on", port);
    console.log("All other groups ain't got nuthin' on mukipayz!");
});
