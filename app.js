'use strict';

//env
require('dotenv').config();
var httpServer = require('./server');
//main app
var express = require('express'),

    app = express(),
    logger = require('morgan'),
    path = require('path'),
    methodOverride = require('method-override'),
    bodyParser = require('body-parser'),
    cookieSession = require("cookie-session"),

    mware = require('./middleware');

// ADDED
var fs = require('fs');




var httpsOptions = {
    key: fs.readFileSync("./server.key"),
    cert: fs.readFileSync("./server.crt")
};

// var httpPort = 8080;
var securePort = process.env.PORT || 443;

var https = require('https').createServer(httpsOptions, app);
var io = require('socket.io')(https);


//setup views
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');


//required routes
var routes = {
    index: require('./routes/index'),
    auth: require('./routes/auth/auth'),
    home: require('./routes/home/home'),
    dwolla: require('./routes/auth/dwolla'),
    // email: require('./routes/email/email')
};


// httpApp.use('/', function (req, res, next) {
// res.redirect("https://" + req.hostname + ":" + securePort + req.path);
// });
// httpApp.listen(8000, function(){
//   console.log("http server started");
// });

//app middleware
// app.use(forceSSL);
app.use(logger('dev'));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieSession({
    name: 'mukipayz',
    keys: [process.env.SECRET_ONE, process.env.SECRET_TWO]
}));


// app.use(passport.initialize());
// app.use(passport.session());


//routes middleware
// app.use('/home/:id', routes.home);
app.use('/auth', routes.auth);
app.use('/', routes.index);
app.use('/home', mware.isLoggedIn, routes.home);
app.use('/dwolla', mware.isLoggedIn, routes.dwolla);
// app.use('/email', routes.email);

//handle all socket connections
io.on('connection', function(socket) {
    console.log("socket connected");
    // console.log("socket.request: ", socket.request.headers);
    socket.on('messages', function(msg) {
        console.log("INCOMING MESSAGE: ", msg);
        io.emit('messages', msg);
    });
    socket.on('disconnect', function() {
        console.log('socket disconnected');
    });
});

// error handlers
//handle any other routes that don't exist
app.use('*', function(req, res, next) {
    var err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    console.log("env = development");
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        var issue = JSON.stringify({
            error: {
                message: err.message,
                error: err
            },
            stack: err.stack
        });
        res.send(issue);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('pages/404', {
        error: {
            message: err.message,
            error: err.status
        }
    });
});
httpServer(securePort);

https.listen(securePort, function() {
    console.log("https listening on", securePort);
    console.log("All other groups ain't got nuthin' on mukipayz!");
});
