'use strict';
var socket = io();

var messageBox = document.getElementById('messages-box');
// console.log("msg: ", messageBox);
//listening for new message addition
socket.on('messages', function(msg) {
    var li = document.createElement('li');
        li.className = "message col-md-12 green";
        var div = document.createElement('div');
            div.className = "col-xs-12 message-content";
            var p = document.createElement('p');
                p.innerHTML = msg;
            div.appendChild(p);
        li.appendChild(div);
    messageBox.insertBefore(li,messageBox.children[0]);
});
