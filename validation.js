'use strict';

function isEmail(email) {
    var re = /\S+@\S+\.\S+/;
    if (re.test(email)) {
        //do this because valid

        return re.test(email);
    } else {
        //do this because unvalid

        return re.test(email);
    }
}
// console.log(isEmail('dan'));
// console.log(isEmail('dan@dan.com'));
// console.log(isEmail('dan19@yahoo.com'));
function isSix(password) {
    if (password.length < 6) {
        //do this because valid

        return "Valid";
    } else {
        //do this because unvalid

        return "Invalid";
    }
}
// console.log(isSix('hbwfhlasifbdlf'));
// console.log(isSix('asdf'));
// console.log(isSix('123fd'));
function isNum(money) {
    if (typeof money !== 'number') {
        //do this because input is not a number and needs to be

        return "not a number..yet";
    } else {
        //do this because input is good to go, valid, a number

        return "run along you little number";
    }
}
// console.log(isNum('a'));
// console.log(isNum(99));
// console.log(isNum(10.3));

module.exports = {
  isEmail : isEmail(),
  isSix : isSix(),
  isNum : isNum()
};
