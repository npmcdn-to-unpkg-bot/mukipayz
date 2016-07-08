'use strict';
var socket = io();

var socketButton = document.getElementById('socket-button');
var socketMessage = document.getElementById('socket-message');
socketButton.addEventListener('click', function(e) {
    e.preventDefault();
    if (!socketMessage.value || socketMessage.value === '') {
        return;
    }
    var path = window.location.pathname;
    var messageVal = {
       message: socketMessage.value
    };
    ajax('POST', path, messageVal, function(data) {

        if (data.status === 'success') {

            // console.log("user: ", data.user);

            //broadcast to socket
            socket.emit('messages', data);
            socket.on('messages', function(data) {
                //when emit is successful
                window.location.assign(path.substring(0, path.indexOf('/messages')));
            });

        }
        // window.location.assign(path.substring(0, path.indexOf('/messages')));
    });
});


function ajax(method, route, data, callback) {
    var req = new XMLHttpRequest();
    req.onload = function() {
        return callback(JSON.parse(this.responseText));
    };
    req.open(method, route);
    if (method === 'POST') {
        req.setRequestHeader('Content-Type', 'application/json');
        req.setRequestHeader('Accept', 'application/json');
        req.send(JSON.stringify(data));
    } else {
        throw new Error('No GET setup yet');
    }
}
