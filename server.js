'use strict';
function httpServer (securePort){
  var express = require('express');
  var httpApp = express();


httpApp.use('/', function (req, res, next) {
  // res.redirect(['https://', req.get('Host'), req.url].join(''));
res.redirect("https://" + req.hostname + ":" + securePort + req.path);


});
httpApp.listen(80, function(){
  console.log("http server started");
});
}

module.exports = httpServer;
