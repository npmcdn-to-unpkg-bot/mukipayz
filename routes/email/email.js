'use strict';

var express = require('express');
var router = express.Router();
var knex = require('../../db/knex');
// var Mailgun = require('mailgun-js');
var bodyParser = require('body-parser');
var email= require('../../emailer');

//api key, from Mailgun’s Control Panel
// var api_key = 'key-1e7f337e6b0b7ae89562027bc23e334d';
//
// //domain, from the Mailgun Control Panel
// var domain = 'sandbox406725ad86c649af95276648504536a6.mailgun.org';
//
// //sending email address
// var from_who = 'mukipayz@gmail.com';

//Do something when you're landing on the first page
router.get('/', function(req, res) {
  console.log("getting /")
    //render the index.jade file - input forms for humans
    console.log("index")
    res.render('index', function(err, html) {
        if (err) {
            // log any error to the console for debug
            console.log(err);
        }
        else {
            //no error, so send the html to the browser
            res.send(html)
        };
    });
});


// Send a message to the specified email address when you navigate to /submit/someaddr@email.com
// The index redirects here
router.post('/submit', function(req,res) {
  console.log(req.body);
  email(req.body.invite_email, function(err, body){
    if (err) {
        res.render('email/error', { error : err});
        console.log("got an error: ", err);
    }
    // //Else we can greet    and leave
    else {
        //Here "submitted.ejs" is the view file for this landing page
        //We pass the variable "email" from the url parameter in an object rendered by ejs
        res.render('pages/addUserGroup', {success: "you invited a user"});
        console.log(body);
    }
  });

    //
    // //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
    // var mailgun = new Mailgun({apiKey: api_key, domain: domain});
    //   // console.log(req.body);
    // var data = {
    // //Specify email data
    //   from: from_who,
    // //The email to contact
    //   to: req.body.invite_email,
    // //Subject and text data
    //   subject: 'You Have Been Summoned to Mukipayz',
    //   html: 'You have a friend at Mukipayz. Mukipayz makes cost sharing easy. Come join your friend and help share the costs!'
    // }
    //
    // //Invokes the method to send emails given the above data with the helper libraryrs
    // mailgun.messages().send(data, function (err, body) {
    //     //If there is an error, render the error page
    //     if (err) {
    //         res.render('email/error', { error : err});
    //         console.log("got an error: ", err);
    //     }
    //     // //Else we can greet    and leave
    //     else {
    //         //Here "submitted.ejs" is the view file for this landing page
    //         //We pass the variable "email" from the url parameter in an object rendered by ejs
    //         res.render('pages/addUserGroup');
    //         console.log(body);
    //     }
    // });

});

module.exports = router;
