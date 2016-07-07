'use strict';
var Mailgun = require('mailgun-js');
var api_key = process.env.API_KEY;
var domain = process.env.DOMAIN;

//sending email address
var from_who = 'mukipayz@gmail.com';

function email(emailAddress, callback){
var mailgun = new Mailgun({apiKey: api_key, domain: domain});
  // console.log(req.body);
var data = {
//Specify email data
  from: from_who,
//The email to contact
  to: emailAddress,
//Subject and text data
  subject: 'You Have Been Summoned to Mukipayz',
  html: 'You have a friend at Mukipayz. Mukipayz makes cost sharing easy. Come join your friend and help share the costs!'
};

//Invokes the method to send emails given the above data with the helper libraryrs
mailgun.messages().send(data, callback);
}
module.exports=email;
