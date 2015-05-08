/// <reference path="../vendor/underscore.d.ts" />
/// <reference path="../vendor/strophe.d.ts" />

var WEB_API_HOST = window.location.hostname;
var WEB_API_PORT = 8000;

var webSockets = {};

function HasWebSocketForRoom(room) {
    return webSockets.hasOwnProperty(room);
}

function SendRoomMessage(room, msg) {
    if (HasWebSocketForRoom(room)) {
        webSockets[room].send(msg.toString());
    }
}

function SendWebSocketGroupChatMessage(messageType, room, input) {
    if (HasWebSocketForRoom(room)) {
        SendRoomMessage(room, $msg({ to: room, from: room + '/' + userName, type: 'groupchat' }).c('body').t(input));
    } else {
        CreateWebSocketForRoom(room, function() {
            SendWebSocketGroupChatMessage(messageType, room, input);
        });
    }
}

function CreateWebSocketForRoom(room, onConnectedCallback) {
    var roomHost = GetHostFromRoom(room);

    if (!roomHost) {
        throw new Error('expected to find chat host from room "' + room + '"');
    }

    var webSocket = webSockets[room] = new WebSocket('ws://' + WEB_API_HOST + ':' + WEB_API_PORT + '/api/chat', 'xmpp');

    webSocket.onopen = function(e) {
        console.log('onopen', e);

        // open stream
        SendRoomMessage(room, $openStream({ to: roomHost }));
    };

    webSocket.onmessage = function(e) {
        var xmlDoc = ParseXml(e.data);

        switch (xmlDoc.documentElement.nodeName) {
            case 'stream:stream':
                console.log('stream:stream response', xmlDoc.documentElement);
                break;
            case 'stream:features':
                console.log('stream:features response', xmlDoc.documentElement);

                // close stream when navigating away from page
                $(window).unload(function() {
                    if (webSocket.readyState == webSocket.OPEN) {
                        SendRoomMessage(room, $closeStream());
                    }
                });

                // auth user
                SendRoomMessage(room, $auth({ loginToken: loginToken }));

                break;
            case 'failure':
                console.log('failure response', xmlDoc.documentElement);

                break;
            case 'success':
                console.log('success response', xmlDoc.documentElement);

                // bind
                SendRoomMessage(room, $iq({ type: 'set' }).c('bind', { xmlns: 'urn:ietf:params:xml:ns:xmpp-bind' }));

                break;
            case 'iq':
                console.log('iq response', xmlDoc.documentElement);

                var iq = xmlDoc.documentElement;

                if (iq.getAttribute('type') !== 'result') {
                    return;
                }

                if (iq.getElementsByTagName('bind').length !== 0) {
                    var jids = iq.getElementsByTagName('jid');
                    if (jids.length !== 0) {
                        // var jid = jids[0].childNodes[0].nodeValue;

                        // set session
                        SendRoomMessage(room, $iq({ to: roomHost, type: 'set' }).c('session', { xmlns: 'urn:ietf:params:xml:ns:xmpp-session' }));
                    }
                } else if (iq.getElementsByTagName('session').length !== 0) {
                    // join _global room
                    SendRoomMessage(room, $pres({ to: room + '/' + userName }).c('x', { xmlns: 'http://jabber.org/protocol/muc' }));
                }

                break;
            case 'presence':
                console.log('presence response', xmlDoc.documentElement);

                var presence = xmlDoc.documentElement;

                // when user connected
                if (presence.getAttribute('to')) {
                    onConnectedCallback();
                }

                break;
            case 'message':
                console.log('message response', xmlDoc.documentElement);

                var message = xmlDoc.documentElement;

                var messageType = 2;

                var from = message.getAttribute('from');

                var body = message.getElementsByTagName('body')[0].childNodes[0].nodeValue;

                var nick = message.getElementsByTagName('nick')[0].childNodes[0].nodeValue;

                var isCse = message.getElementsByTagName('cseflags').length !== 0;

                OnChat(messageType, from, body, nick, isCse);

                break;
            default:
                console.log('unhandled response', xmlDoc.documentElement.nodeName, xmlDoc.documentElement);
                break;
        }
    };

    webSocket.onerror = function(e) {
        console.log('onerror', e);
    };

    webSocket.onclose = function(e) {
        console.log('onclose', e);

        delete webSockets[room];
    };

    return webSocket;
}

function GetHostFromRoom(room) {
    var parts = room.split('@');
    if (parts.length == 2) {
        return parts[1];
    }
}

function ParseXml(xml) {
    if (typeof DOMParser !== 'undefined') {
        var domParser = new DOMParser();
        return domParser.parseFromString(xml, 'text/xml');
    } else if (typeof ActiveXObject !== 'undefined' && new ActiveXObject("Microsoft.XMLDOM")) {
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xml);
        return xmlDoc;
    } else {
        throw new Error('No XML parser found');
    }
};

function $openStream(attrs) {
    if (!_.isObject(attrs)) {
        attrs = {};
    }

    if (!_.isString(attrs.xmlns)) {
        attrs.xmlns = 'jabber:client';
    }

    if (!_.isString(attrs['xmlns:stream'])) {
        attrs['xmlns:stream'] = 'http://etherx.jabber.org/streams';
    }

    if (!_.isString(attrs.version)) {
        attrs.version = '1.0';
    }

    return {
        toString: function() {
            var data = [];

            for (var key in attrs) {
                if (attrs.hasOwnProperty(key) && key != 'xmlns' && key != 'xmlns:stream' && key != 'version') {
                    data.push(" ", key, "='", attrs[key], "'");
                }
            }

            return "<?xml version='1.0'?><stream:stream" + data.join('') + " xmlns='" + attrs.xmlns + "' xmlns:stream='" + attrs['xmlns:stream'] + "' version='" + attrs.version + "'>";
        }
    };
}

function $closeStream() {
    return {
        toString: function() {
            return "</stream:stream>";
        }
    };
}

function $auth(attrs) {
    if (!_.isObject(attrs))
        attrs = {};

    if (!_.isString(attrs.value)) {
        if (!_.isString(attrs.loginToken) && (!_.isString(attrs.username) || !_.isString(attrs.password))) {
            throw new Error('$auth requires login token or username and password');
        }
    }

    if (!_.isString(attrs.mechanism)) {
        attrs.mechanism = 'PLAIN';
    }

    if (!_.isString(attrs.xmlns)) {
        attrs.xmlns = 'urn:ietf:params:xml:ns:xmpp-sasl';
    }

	return {
        toString: function() {
            var value = attrs.value ? attrs.value : Base64.encode(attrs.loginToken ? attrs.loginToken : "\0" + attrs.username + "\0" + attrs.password);

            return "<auth xmlns='urn:ietf:params:xml:ns:xmpp-sasl' mechanism='" + attrs.mechanism + "'>" + value + "</auth>";
        }
    }
}