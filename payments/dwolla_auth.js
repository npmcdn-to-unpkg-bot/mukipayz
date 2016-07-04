'use strict';

var express = require('express'),
    router  = express.Router();

var dwolla = require('dwolla-v2');
var client = new dwolla.Client({
    environment: 'sandbox',
    id: process.env.DWOLLA_ID,
    secret: process.env.DWOLLA_SECRET
});
var accessToken = "rvU7oC4Cz9SJQR27ocDiSMVCBOTixF7vQyIhzbDA9Qz6v7LoxJ;"
var accountToken = new client.Token({access_token: accessToken});
console.log("client: ", client);

const redir = "http://localhost:3000/auth/dwolla/callback";
var authUrl = accountToken.get(redir).then(function(data) {
    console.log("data: ", data);
});
// console.log("authURL: ", authUrl)

const dwolla_url = "https://uat.dwolla.com/oauth/v2/authenticate?client_id={client_id}&response_type=code&redirect_uri={redirect_uri}&scope={scope}";

/*From base route /auth **/
router.get('/login', function(req, res) {
    dwolla.then(function(dwolla){
        dwolla.customers.create({
            "firstName": "Bob",
            "lastName": "Merchant",
            "email": "bmerchant@nomail.net",
            "ipAddress": "10.10.10.10",
            "type": "personal",
            "address1": "99-99 33rd St",
            "city": "Some City",
            "state": "NY",
            "postalCode": "11101",
            "dateOfBirth": "1970-01-01",

            // For the first attempt, only
            // the last 4 digits of SSN required

            // If the entire SSN is provided,
            // it will still be accepted
            "ssn": "1234",
            "phone": "3478589191"
          })
          .then(function(data) {
              console.log(data); // https://api-uat.dwolla.com/customers/FC451A7A-AE30-4404-AB95-E3553FCD733F
          });
    });
});


module.exports = router;
