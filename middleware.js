'use strict';


var middleware = {
    isLoggedIn: function(req, res, next) {
      console.log("here?");
        //to access /home routes, user must be logged in
        if (!req.session.user) {
            //if user is not logged in
            res.redirect('/auth/login');
        } else {
            next();
        }
    }
};


module.exports = middleware;
