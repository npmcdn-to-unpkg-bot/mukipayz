'use strict';

//env
require('dotenv').config();

//main app
var express = require('express'),
    app = express(),
    logger = require('morgan'),
    path = require('path'),
    methodOverride = require('method-override'),
    bodyParser = require('body-parser'),
    cookieSession = require("cookie-session"),
    passport = require('passport');
//setup views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//required routes
var routes = {
    landing: require('./routes/landing'),
    index: require('./routes/index'),
    auth : require('./routes/auth/auth')

    // home: require('./routes/home/:id')
};

//app middleware
app.use(logger('dev'));
app.use(express.static(__dirname+'/public'));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieSession({
    name: 'mukipayz',
    keys: [process.env.SECRET_ONE, process.env.SECRET_TWO]
}));


//routes middleware
// app.use('/home/:id', routes.home);
app.use('/auth', routes.auth);
// app.use('/login', routes.login);
app.use('/', routes.index);


const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("listening on", port);
    console.log("All other groups ain't got nuthin' on mukipayz!");
});
