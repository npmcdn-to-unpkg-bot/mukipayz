'use strict';

//env
require('dotenv').config();

//main app
var express = require('express'),
    app = express(),

    logger = require('morgan'),
    path = require('path'),
   methodOverride = require('method-override');

//setup views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//required routes
var routes = {
    landing: require('./routes/landing'),
    index: require('./routes/index'),
    login:require('./routes/login')
};

//app middleware
app.use(logger('dev'));
app.use(express.static(__dirname+'/public'));
app.use(methodOverride('_method'));

//routes middleware
app.use('/', routes.index);
app.use('/', routes.login);
app.set('view engine', 'ejs');
const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("listening on", port);
    console.log("All other groups ain't got nuthin' on mukipayz!");
});
