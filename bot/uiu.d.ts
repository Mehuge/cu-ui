declare module UIU {
    export interface Connection {
        message(value: string);
        broadcast(value: string);
        command(value: string, args: string[]);
        onopen();
        onmessage(data);
        onclose();
    }
    export function start(): Connection;
}