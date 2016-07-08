'use strict';
var dwolla = require('dwolla-node'),
    dwolla = dwolla(process.env.DWOLLA_KEY_SANDBOX, process.env.DWOLLA_SECRET_SANDBOX); // initialize API client
var express = require('express'),
    router  = express.Router();
var knex = require('../../db/knex');


const redirect_uri = 'http://localhost:3000/dwolla/auth/callback';

// use sandbox API environment
dwolla.sandbox = true;

router.get('/login', function(req, res) {
    var authUrl = dwolla.authUrl(redirect_uri, 'AccountInfoFull|Transactions|Balance|Send|Request');
    return res.redirect(authUrl);
});


// GET /auth/dwolla/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
// router.get('/auth/callback',
//     passport.authenticate('dwolla', { failureRedirect: '/dwolla', successRedirect: '/dwolla/user/setup' }),
//     function(req, res) {
//         if (req.user) {
//             res.redirect('/dwolla/user/setup');
//         } else {
//             res.redirect('/dwolla');
//         }
//     });

router.get('/auth/callback', function(req, res) {
    if (!req.query.code) {
        return res.redirect('/dwolla/login');
    }
    dwolla.finishAuth(req.query.code, redirect_uri, function(error, auth) {
        dwolla.setToken(auth.access_token);
        // console.log("dwolla: ", dwolla.getToken());
        var token = dwolla.getToken();
        dwolla.fullAccountInfo(function(err, user) {
            req.session.user.dwolla = user;
            res.redirect('/dwolla/user/setup');
        });
        // res.json({
        //     auth: auth,
        //     token: token
        // });
    //     // res.json(auth);
    //     // dwolla.basicAccountInfo(auth.account_id, function(user) {
    //     //     user: user
    //     // });
    //
    //    var output = "Your OAuth access_token is: <b>" + auth.access_token + "</b>, which will expire in " + auth.expires_in + " seconds.<br>Your refresh_token is: <b>" + auth.refresh_token + "</b>, and that'll expire in " + auth.refresh_expires_in + " seconds.";
    //    output += '<br><a href="/dwolla/refresh?refreshToken=' + encodeURIComponent(auth.refresh_token) + '">Click here to get a new access and refresh token pair!</a>';
    //    return res.send(output);
   });
});


router.get('/refresh', function(req, res) {
    dwolla.refreshAuth(req.query.refreshToken, function(error, auth) {
        if (error) return res.send(error);
        dwolla.setToken(auth.access_token);
        req.session.user.access_token = auth.access_token;
        var output = "Your OAuth access_token is: <b>" + auth.access_token + "</b>, which will expire in " + auth.expires_in + " seconds.<br>Your refresh_token is: <b>" + auth.refresh_token + "</b>, and that'll expire in " + auth.refresh_expires_in + " seconds.";
        output += '<br><a href="/dwolla/refresh?refreshToken=' + encodeURIComponent(auth.refresh_token) + '">Click here to get a new access and refresh token pair!</a>';
        output += '<br><a href="/dwolla/catalog?token=' + encodeURIComponent(auth.access_token) + '">See Catalog Of Available Endpoints</a>';
        return res.send(output);
    });
});

router.get('/catalog', function(req, res) {
    dwolla.catalog(req.query.token, function(error, links) {
        if (error) return res.send(error);
        console.log("links: ", links);
        dwolla.balance(function(err, bal) {
            return res.json({
                links: links,
                balance: bal
            });
        });
        // var output = "The endpoints that you can use are:"

        // return res.json({
        //     links: links,
        //     balance: dwolla
        // });
    });
});

router.get('/user/setup', function(req, res) {
    knex('dwolla').where({
        user_id: req.session.user.user_id
    }).then(function(user) {
        console.log("user: ", user[0]);
        // res.json({
        //     token: dwolla.getToken(),
        //     sessToken: req.session.user.access_token
        // });
        // console.log("session: ", req.session.user);

        if (!user[0]) {
            //if user doens't exist in database yet
            knex('dwolla').insert({
                user_id: req.session.user.user_id,
                dwolla_id: req.session.user.dwolla.Id,
                dwolla_account_id: req.session.user.dwolla.AccountId
            }).then(function(dwolla_user) {
                handleRedirect();
            }).catch(function(err) {
                res.json({
                    err: err
                });
            });
        } else {
            if (user[0].dwolla_id !== req.session.user.dwolla.Id) {
                knex('dwolla').where({user_id: req.session.user.user_id}).update({
                    dwolla_id: req.session.user.dwolla.Id,
                    dwolla_account_id: req.session.user.dwolla.AccountId
                }).then(function(dwolla_user) {
                    handleRedirect(true);
                }).catch(function(err) {
                    res.json({
                        err: err
                    });
                    console.error("Error saving dwolla user");
                });
            } else {
                //user exists in database and is logged in as same user
                handleRedirect(false);
            }
        }
    });

    function handleRedirect(user_updated) {
        if (req.session.dwolla_payment_path) {
            //user is coming from /payment route and wants to pay
            res.redirect('/dwolla/payment');
        } else {
            //route user back to home
            /**FIXME!! */
            // res.redirect('/home');
            res.redirect('/dwolla/payment');
        }
    }
});


router.get('/payment', function(req, res) {
    //check if bill owner has a dwolla
    //if not route away
    res.render('pages/dwollaPin', {error:null});
});

router.post('/payments', function(req, res) {
    if (req.session.user && req.session.user.dwolla) {
        //if user has dwolla and is logged in
        dwolla.basicAccountInfo('hottmanmichael@gmail.com', function(user) {
            res.json({
                user: req.session,
                dwolla: user
            });
        });
        // res.json({
        //     user: req.session
        // });
        // var path = DWOLLA_API + 'accounts/'+account_id;
    } else {
        //also check access token validity,
        //try refresh token
        //otherwise send to login

        //if user isn't logged into dwolla,
        //route them to OAuth login, with payments path cookie
        console.log("req.body.DwollaPayment: ", req.body.DwollaPayment);
        req.session.dwolla_payment_path = {
            payroute: true,
            amount: req.body.DwollaPayment,
            message: req.session.user.first_name + " has payed you " + req.body.DwollaPayment + " "
        };
        res.redirect('/dwolla/login');
    }
});


router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//
// router.get('/user/setup', function(req, res) {
//     console.log("req user in user setup: ", req.user._json.Response);
//
//     //check dwolla db for existing user data
//     //if the user data exists, compare the user account_id with the incoming req.user account_id
//         //if they don't match, replace keys in db
//     //if user doesn't exist, create new dwolla user
//     DB.Dwolla().where({
//         user_id: req.session.user.user_id,
//     }).then(function(user) {
//         if (!user[0]) {
//
//             // return res.json({
//             //     user: req.user._json.Response
//             // })
//             //if user doesn't exist yet in db
//             DB.Dwolla().insert({
//                 user_id: req.session.user.user_id,
//                 dwolla_id: req.user._json.Response.Id,
//                 dwolla_account_id: req.user._json.Response.AccountId
//             }).then(function(user) {
//                 handleRedirect(req);
//             });
//         } else {
//             DB.Dwolla().where({
//                 user_id: req.session.user.user_id,
//             }).update({
//                 dwolla_id: req.user._json.Response.Id,
//                 dwolla_account_id: req.user._json.Response.AccountId
//             }).then(function(updatedUser) {
//                 console.log("updated user");
//                 handleRedirect(req);
//             });
//         }
//     });
//
//     function handleRedirect(req) {
//         if (req.session.dwolla_payment_path) {
//             //redirecting to payments
//             req.session.dwolla_payment_path = null;
//             res.redirect('/dwolla/payment');
//         } else {
//             //user just wanted to login
//             res.redirect('/home');
//         }
//     }
// });
//

//
//
//

module.exports = router;
