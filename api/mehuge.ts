module Mehuge {
    var connected = false;
    enum XmppMessageType {
        NORMAL = -1,
        ERROR = 0,
        CHAT = 1,
        GROUPCHAT = 2,
        HEADLINE = 3
    }
    export function connect() {
        cuAPI.JoinMUC("uicomms");
        cuAPI.OnChat((type: number, from: string, body: string, nick: string, iscse: boolean) => {
            debugger;
        });
    }

    export function sendMessage(message: string) {
        if (!connected) {
            connect();
        }
        cuAPI.SendChat(XmppMessageType.NORMAL, "uicomms@conference.chat.camelotunchained.com", JSON.stringify(message));
    }
} 