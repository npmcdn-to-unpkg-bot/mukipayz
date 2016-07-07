'use strict';
var Mailgun = require('mailgun-js');


//sending email address
var from_who = 'mukipayz@gmail.com';

function email(emailAddress, password, callback){
var mailgun = new Mailgun({apiKey: process.env.API_KEY, domain: process.env.DOMAIN});
  // console.log(req.body);
var data = {
//Specify email data
  from: from_who,
//The email to contact
  to: emailAddress,
//Subject and text data
  subject: 'You Have Been Summoned to Mukipayz',
  html: 'You have a friend at Mukipayz. Mukipayz makes cost sharing easy. Come to mukipayz.com and use your e-mail and this password: ' + password
};

//Invokes the method to send emails given the above data with the helper libraryrs
mailgun.messages().send(data, callback);
}
module.exports=email;
