// const WebSocket = require('ws');
import WebSocket from 'ws';



export class SessionId {

    keepAliveTimeout = null;
    attemptReconnect = true;
    keepAliveFor = null;
    onSubscribe = undefined;
    session_id = null;
    readyState = 0;

    onNotification = null;

    constructor() {

    }

    connect() {

        console.log("Connect to server...")

        //PRODUCTION
        //this._server = new WebSocket('wss://eventsub.wss.twitch.tv/ws');
        //TEST
        this.server = new WebSocket('ws://127.0.0.1:8080/ws');

        this.server.onmessage = this.processMessage.bind(this)

    }

    processMessage(event) {
        // console.log(event.data)
        const msg = JSON.parse(event.data);

        // HANDLE DUPLICATE MESSAGES

        console.log(msg.metadata.message_type)

        // NOTIFICATION
        if (msg.metadata.message_type == 'session_reconnect') {
            // config.eventsubURL = msg.payload.session.reconnect_url;
            console.log('Handle reconnect to', config.eventsubURL);
            // reconnect();
        }

        // HANDLE DISCONNECT
        if (msg.metadata.message_type == 'session_disconnect') {
            // ?
            // close();
            // reconnect();
        }

        // KEEP-ALIVE
        if (msg.metadata.message_type == 'session_keepalive') {
            this.updateTimeout();
        }

        // WELCOME
        if (msg.metadata.message_type == 'session_welcome') {
            this.session_id = msg.payload.session.id;
            this.keepAliveFor = msg.payload.session.keepalive_timeout_seconds;
            console.log(msg);
            console.log('Welcome message received', this.session_id);

            this.connectAttempt = 1; // reset connection attempts

            // subscribe to notifications
            if ((this.session_id) && (this.onSubscribe != undefined)) {
                this.onSubscribe(this.session_id)
            }

            // set keepalive check
            this.updateTimeout();

        }

        // NOTIFICATION
        if (msg.metadata.message_type == 'notification') {
            // handleNotification(msg);

            if ((this.session_id) && (this.onNotification != undefined)) {
                this.onNotification(this.session_id, msg)
            }



            this.updateTimeout();
        }


    }


    updateTimeout() {
        clearTimeout(this.keepAliveTimeout);

        this.keepAliveTimeout = setTimeout(function() {
            console.warn('Keep-Alive Timeout! Trying to reconnect …');
            this.close();

            if (this.attemptReconnect) {
                this.reconnect();
            }
        }, (this.keepAliveFor + 5) * 1000); // add 5 seconds grace period
    }


    close() {

        console.log("close server...")

        clearTimeout(this.keepAliveTimeout);

        // unsubscribe notifications
        // for (const sub of config.subscriptions) {
        //     if (sub.id) {
        //         console.log('Unsubscribing', sub);
        //         unsubscribe(sub.id);
        //     }
        // }

        // close websocket connection
        if (this.server && this.server.close) {
            this.server.close();

            this.server = null;
        }

        console.info('Connection closed.');
    }

    reconnect() {
        console.log("reconnect to server...")

        // todo: maybe reset some values?

        if (this.readyState === 1) {
            close();
        }

        // kill app after max attempts, about 2.5 hours of trying
        if (this.connectAttempt > 12) {
            console.error("Disconnect max attempts reached")
            return;
        }

        const delay = Math.pow(2, this.connectAttempt);

        console.warn('Reconnecting, attempt', this.connectAttempt, delay);
        setTimeout(this.connect, delay * 1000);

    }

}