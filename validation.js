'use strict';

    //for some reason the validation for the email is working already so the email validation is good to go
    // function isEmail(email) {
    // email = document.getElementById('').value;
    //     var re = /\S+@\S+\.\S+/;
    //     if (re.test(email)) {
    //         //do this because valid
    //
    //         return re.test(email);
    //     } else {
    //         //do this because unvalid
    //         alert("email is not valid")
    //         return re.test(email);
    //     }
    // }
    // console.log(isEmail('dan'));
    // console.log(isEmail('dan@dan.com'));
    // console.log(isEmail('dan19@yahoo.com'));

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
    // console.log(isSix('hbwfhlasifbdlf'));
    // console.log(isSix('asdf'));
    // console.log(isSix('123fd'));

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

// console.log(isNum('a'));
// console.log(isNum(99));
// console.log(isNum(10.3));

module.exports = {
isSix : isSix(),
isNum : isNum()
}
