'use strict';

    function isSix(password) {
        password = document.getElementById('password').value;
        if (password.length < 6) {
            //do this because valid
            return "Valid";
        } else {
            //do this because unvalid
            alert("Password is invalid")
            return "Invalid";
        }
    }
    function isNum(money) {
          money = document.getElementById('').value;
        if (typeof money !== 'number') {
            //do this because input is not a number and needs to be
            return "not a number..yet";
        } else {
            //do this because input is good to go, valid, a number
            return "run along you little number";
        }
    }

module.exports = {
isSix : isSix(),
isNum : isNum()
}
