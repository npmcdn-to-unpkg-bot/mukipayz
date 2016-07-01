'use strict';

var express = require('express'),
    router  = express.Router();

var dwolla = require('dwolla-v2');
var client = new dwolla.Client({id: process.env.DWOLLA_ID, secret: process.env.DWOLLA_SECRET});
var accessToken = "rvU7oC4Cz9SJQR27ocDiSMVCBOTixF7vQyIhzbDA9Qz6v7LoxJ;"
var accountToken = new client.Token({access_token: accessToken});
console.log("client: ", client);

const dwolla_url = "https://uat.dwolla.com/oauth/v2/authenticate?client_id={client_id}&response_type=code&redirect_uri={redirect_uri}&scope={scope}";

/*From base route /auth **/
router.get('/login', function(req, res) {
    accountToken
        .get('customers', { limit: 10 })
        .then(function(res) {
                res.json({
                    
                });
    });
});


module.exports = router;
