var UIU = {
    start: function () {
        var ws = new WebSocket('ws://localhost:8888/');

        var send = function (val) {
            ws.send(val);
        };

        var message = function (msg) {
            send("M " + msg);
        };

        var command = function (command, args) {
            var msg = JSON.stringify([command ].concat(args));
            send("C " + msg);
        };

        var broadcast = function (msg) {
            send("B " + msg);
        };

        var interface = {
            message: message,
            command: command,
            broadcast: broadcast,
            onmessage: function (data) { },
            onopen: function () { },
            onclose: function () { }
        };

        // when data is comming from the server, this metod is called
        ws.onmessage = function (evt) {
            interface.onmessage(evt.data);
        };

        // when the connection is established, this method is called
        ws.onopen = function () {
            // inc.innerHTML += '.. connection open<br/>';
            interface.onopen();
        };

        // when the connection is closed, this method is called
        ws.onclose = function () {
            // inc.innerHTML += '.. connection closed<br/>';
            interface.onclose();
        }
        return interface;
    }
};
