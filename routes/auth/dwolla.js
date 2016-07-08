'use strict';
var dwolla = require('dwolla-node'),
    dwolla = dwolla(process.env.DWOLLA_KEY_SANDBOX, process.env.DWOLLA_SECRET_SANDBOX); // initialize API client
var express = require('express'),
    router  = express.Router();
var knex = require('../../db/knex');
var Promise = require('bluebird');
var request = require('request');
var moment = require('moment');


const REDIRECT_URI = process.env.DWOLLA_REDIRECT || 'http://localhost:3000/dwolla/auth/callback';
const PAYMENT_URL = process.env.PAYMENT_URL || 'http://localhost:3000/dwolla/payment';

// use sandbox API environment
dwolla.sandbox = true;

router.get('/login', function(req, res) {
    var authUrl = dwolla.authUrl(REDIRECT_URI, 'AccountInfoFull|Transactions|Balance|Send|Request');
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
    dwolla.finishAuth(req.query.code, REDIRECT_URI, function(error, auth) {
        if (!auth.access_token) {
            var r_token = req.session.refresh_token;
            if (!r_token) {
                r_token = auth.refresh_token;
            }
            return res.redirect('/dwolla/refresh?refreshToken='+r_token);
        }

        dwolla.setToken(auth.access_token);
        req.session.access_token = auth.access_token;
        req.session.refresh_token = auth.refresh_token;
        // console.log("dwolla: ", dwolla.getToken());
        var token = dwolla.getToken();
        dwolla.fullAccountInfo(function(err, user) {
            req.session.user.dwolla = user;
            res.redirect('/dwolla/user/setup');
        });
   });
});


router.get('/refresh', function(req, res) {
    dwolla.refreshAuth(req.query.refreshToken, function(error, auth) {
        if (error) return res.redirect('/dwolla/login');
        dwolla.setToken(auth.access_token);
        req.session.access_token = auth.access_token;
        req.session.refresh_token = auth.refresh_token;
        dwolla.fullAccountInfo(function(err, user) {
            req.session.user.dwolla = user;
            return res.redirect('/dwolla/user/setup');
        });
    });
});

router.get('/user/setup', function(req, res) {
    console.log("req.session: ", req.session);
    knex('dwolla').where({
        user_id: req.session.user.user_id
    }).then(function(user) {
        if (!user[0]) {
            //if user doesn't exist in database yet
            knex('dwolla').insert({
                user_id: req.session.user.user_id,
                dwolla_id: req.session.user.dwolla.Id,
                dwolla_account_id: req.session.user.dwolla.AccountId
            }).then(function(dwolla_user) {
                handleRedirect();
            }).catch(function(err) {
                req.session.dwolla_payment_path = req.session.dwolla_payment_path || {};
                req.session.dwolla_payment_path.result = {
                    status: 'failure',
                    message: "There was an error saving your Dwolla Account details. Please try again."
                };
                return res.redirect('/dwolla/payment/result');
            });
        } else {
            if (user[0].dwolla_id !== req.session.user.dwolla.Id) {
                knex('dwolla').where({user_id: req.session.user.user_id}).update({
                    dwolla_id: req.session.user.dwolla.Id,
                    dwolla_account_id: req.session.user.dwolla.AccountId
                }).then(function(dwolla_user) {
                    handleRedirect(true);
                }).catch(function(err) {
                    req.session.dwolla_payment_path = req.session.dwolla_payment_path || {};
                    req.session.dwolla_payment_path.result = {
                        status: 'failure',
                        message: "There was an error updating your Dwolla Account details. Please try again."
                    };
                    return res.redirect('/dwolla/payment/result');
                });
            } else {
                //user exists in database and is logged in as same user
                return handleRedirect(false);
            }
        }
    });

    function handleRedirect(user_updated) {
        if (req.session.dwolla_payment_path) {
            //user is coming from /payment route and wants to pay
            return res.redirect('/dwolla/payment');
        }
        //user not coming from payments route
        return res.redirect('/home');
    }
});

router.get('/payment', function(req, res) {
    console.log("here??")
    if (!req.session.access_token) {
        return res.redirect('/dwolla/login');
    }
    if (!req.session.dwolla_payment_path) {
        return res.redirect('/dwolla/login');
    } else {
        if (!req.session.dwolla_payment_path.bill) {
            return res.redirect('/dwolla/login')
        } else {
            var bill = req.session.dwolla_payment_path.bill;
            if (!req.session.dwolla_payment_path.origin_group) {
                return res.redirect('/home');
            } else {
                var g = req.session.dwolla_payment_path.origin_group;
                var b = req.session.dwolla_payment_path.bill;
                return res.redirect('/home/group/'+g+'/bills/'+b);
            }
        }
    }
});

router.post('/payment', function(req, res) {

    if (!req.session.dwolla_payment_path) {
        req.session.dwolla_payment_path = {
            payroute: true,
            amount: req.body.DwollaPayment,
            source: req.session.user,
            bill: req.query.bill,
            origin_group: req.body.group_id
        }
    }

    if (!req.session.access_token) {
        return res.redirect('/dwolla/login');
    }

    if (!req.session.access_token || !req.session.refresh_token) {
        return res.redirect('/dwolla/login');
    }


    knex('bills').where({id: req.query.bill}).then(function(bill) {

        var fullbill = {
            bill: bill[0],
            payment: req.session.dwolla_payment_path.amount,
            path: req.session.dwolla_payment_path
        };

        Promise.join(
            knex('users').where({id: fullbill.bill.bill_owner}).select('id', 'first_name', 'last_name', 'email'),
            knex('dwolla').where({user_id: fullbill.bill.bill_owner}),
            // knex('dwolla').where({user_id: 3}),
            knex('dwolla').where({user_id: req.session.user.user_id}),
            knex('users').where({id:req.session.user.user_id}).select('id','first_name','last_name','email')
        ).then(function(data) {

            var owner = data[0][0];
            var user = data[3][0];
            var dwolla_account_owner = data[1][0];
            var dwolla_account_sender = data[2][0];

            //ensure both users have dwolla account
            if (!dwolla_account_owner) {
                req.session.dwolla_payment_path = req.session.dwolla_payment_path || {};
                req.session.dwolla_payment_path.result = {
                    status: 'failure',
                    message: "Your bill owner doesn't have a Dwolla account! Once they create an account you can pay them!",
                    origin_group: req.session.dwolla_payment_path.origin_group,
                    origin_bill: req.session.dwolla_payment_path.bill,
                };
                return res.redirect('/dwolla/payment/result');
            }
            //
            if (!dwolla_account_sender) {
                //sender doesn't have account
                // return res.json(data);
                return res.redirect('/dwolla/login');
            }

            var paymentDetails = {
                amount: fullbill.payment,
                sender: user,
                owner: owner,
                dwolla: {
                    sender: dwolla_account_sender,
                    owner:dwolla_account_owner
                }
            };
            return res.render('pages/dwollaPin', {
                error:null,
                payment: paymentDetails
            });
        }).catch(function(err) {
            req.session.dwolla_payment_path = req.session.dwolla_payment_path || {};
            req.session.dwolla_payment_path.result = {
                status: 'failure',
                message: "There was an unexpected error, please try again.",
                origin_group: req.session.dwolla_payment_path.origin_group,
                origin_bill: req.session.dwolla_payment_path.bill
            };
            return res.redirect('/dwolla/payment/result');
        });
    }).catch(function(err) {
        req.session.dwolla_payment_path = req.session.dwolla_payment_path || {};
        req.session.dwolla_payment_path.result = {
            status: 'failure',
            message: "There was an unexpected error, please try again.",
            origin_group: req.session.dwolla_payment_path.origin_group,
            origin_bill: req.session.dwolla_payment_path.bill
        };
        return res.redirect('/dwolla/payment/result');
    });

});

router.post('/payment/send', function(req, res) {
    req.session.dwolla_payment_path = req.session.dwolla_payment_path || {};

    if (!req.session.access_token) {
        return res.redirect('/dwolla/login');
    }
    if (!req.session.access_token && req.session.refresh_token) {
        return res.redirect('/dwolla/refresh?refreshToken='+req.session.refresh_token);
    }

    //init token
    dwolla.setToken(req.session.access_token);

    dwolla.balance(function(err, balance) {
        if (err) {
            if (req.session.refresh_token) {
                return res.redirect('/dwolla/refresh?refreshToken='+req.session.refresh_token);
            } else {
                return res.redirect('/dwolla/login');
            }
        }
        var amountRequested = Number(req.body.amount);
        if (amountRequested > balance) {
            req.session.dwolla_payment_path = req.session.dwolla_payment_path || {};
            req.session.dwolla_payment_path.result = {
                status: 'failure',
                message: "Your Dwolla account balance is too low to make a payment of " + amountRequested + ". Please add more funds to your account.",
                origin_group: req.session.dwolla_payment_path.origin_group,
                origin_bill: req.session.dwolla_payment_path.bill
            };
            return res.redirect('/dwolla/payment/result');
        } else {
            //must wait at least 3 minutes before processing another payment
            checkRecentTransactions();
        }
    });

    function checkRecentTransactions() {
        dwolla.transactionsByApp(function(err, transactions) {
            if (transactions.length > 0) {
                var mostRecentTransaction = transactions[0];
                if (mostRecentTransaction.Status === 'processed') {
                    var t_date = moment.utc(mostRecentTransaction.Date);
                    var now = moment().utc();
                    //wait 2 minutes between transactions
                    if (now.diff(t_date, 'minutes') >= 2) {
                        makePayment();
                    } else {
                        req.session.dwolla_payment_path.result = {
                            status: 'failure',
                            message: "It is likely that your payment was process successfully once. Check your account and your bill before trying again.",
                            origin_group: req.session.dwolla_payment_path.origin_group,
                            origin_bill: req.session.dwolla_payment_path.bill,
                        };
                        return res.redirect('/dwolla/payment/result');
                    }
                }
            }
        });
    }


    function makePayment() {
        req.session.dwolla_payment_path = req.session.dwolla_payment_path || {};
        var pin = req.body.pin;
        var amount = Number(req.body.amount) || Number(dwolla_payment_path.amount);
        var dest = req.body.owner_account_id;
        dwolla.send(pin, dest, amount, function(err, transaction_id) {
            if (!err) {
                knex('payments').insert({
                    amount: amount,
                    user_id: req.session.user.user_id,
                    bill_id: req.session.dwolla_payment_path.bill
                }).then(function(payment) {
                    req.session.dwolla_payment_path.result = {
                        status: 'failure',
                        message: "Your payment was process successfully! Your Dwolla transaction id is " + transaction_id,
                        origin_group: req.session.dwolla_payment_path.origin_group,
                        origin_bill: req.session.dwolla_payment_path.bill,
                    };
                    return res.redirect('/dwolla/payment/result');
                }).catch(function(err) {
                    req.session.dwolla_payment_path.result = {
                        status: 'failure',
                        message: "Your payment was process successfully, but we were unable to save it to your payments records... Your Dwolla transaction id is " + transaction_id,
                        origin_group: req.session.dwolla_payment_path.origin_group,
                        origin_bill: req.session.dwolla_payment_path.bill,
                    };
                    return res.redirect('/dwolla/payment/result');
                });
            } else {
                req.session.access_token = null;
                req.session.dwolla_payment_path.result = {
                    status: 'failure',
                    message: "There was an error processing your payment, please try again.",
                    origin_group: req.session.dwolla_payment_path.origin_group,
                    origin_bill: req.session.dwolla_payment_path.bill,
                };
                return res.redirect('/dwolla/payment/result');
            }
        });
    }
});

router.get('/payment/result', function(req, res) {
    var result = {
        status: 'failure',
        message: 'Oops, something went wrong... Please try again',
        origin_group: req.session.dwolla_payment_path.origin_group,
        origin_bill: req.session.dwolla_payment_path.bill,
    };
    if (req.session.dwolla_payment_path && req.session.dwolla_payment_path.result) {
        result = req.session.dwolla_payment_path.result;
    }
    req.session.dwolla_payment_path = null;
    return res.render('pages/paymentResult', {result:result});
});

//anthing else route to home page
router.get('*', function(req, res) {
    res.redirect('/home');
});

module.exports = router;
