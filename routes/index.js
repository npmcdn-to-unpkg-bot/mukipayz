'use strict';

var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {
    res.render('pages/index', {
        // this seems out of place
        title: 'Express'
    });
});

module.exports = router;
