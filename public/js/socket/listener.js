'use strict';
var socket = io();

var messageBox = document.getElementById('messages-box');
// console.log("msg: ", messageBox);
//listening for new message addition
socket.on('messages', function(data) {
    console.log("data", data);
    var li = document.createElement('li');
        li.className = "message col-md-12 green";
        var div = document.createElement('div');
            div.className = "col-xs-12 message-content";
            var p = document.createElement('p');
                p.innerHTML = data.message.content;
            var user = document.createElement('div');
                user.className = 'col-xs-6 sub-content';
                user.innerHTML = data.user.first_name + " " + data.user.last_name.substring(0,1) + '.';
            var timestamp = document.createElement('div');
                timestamp.className = 'col-xs-6 sub-content';
                timestamp.innerHTML = data.message.created_at;
        div.appendChild(p);
        div.appendChild(user);
        div.appendChild(timestamp);

        li.appendChild(div);
    messageBox.insertBefore(li,messageBox.children[0]);
});
