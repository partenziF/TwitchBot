import { response } from "express"

const TWITCH_API_BASE_URL = 'https://api.twitch.tv/helix'

export class EventSubcriber {

    Client_id = null
    Token = null
    BroadcasterUserId = null

    Subs = []

    constructor(aAuthorization, aBroadcasterUserId) {

        this.Client_id = aAuthorization.configure.client_id
        this.Access_Token = aAuthorization.configure.access_token
        this.BroadcasterUserId = aBroadcasterUserId
    }


    async removeSubs(aId) {

        const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.Token,
            'Client-Id': this.Client_id
        });

        let authorizeUrl = new URL('https://api.twitch.tv/helix' + '/eventsub/subscriptions');
        authorizeUrl.search = new URLSearchParams([
            ['id', aId]
        ]).toString();


        let response = await fetch(authorizeUrl, {
            method: 'DELETE',
            headers: headers,

        })




        if (response.status == 204) {
            return true
        } else {
            console.log(data.status)
            return false;
        }


    }

    async getSubs() {


        const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.Access_Token,
            'Client-Id': this.Client_id
        });

        let response = await fetch('https://api.twitch.tv/helix' + '/eventsub/subscriptions', {
            method: 'GET',
            headers: headers,

        })

        let data = await response.json()

        console.log(JSON.stringify(data))

        if (data.total > 0) {

            for (let i = 0; i < data.total; i++) {

                if (data.data[i].status != 'enabled') {

                    this.removeSubs(data.data[i].id)


                } else {

                }

            }


        }


    }


    createSubs(aSessionId) {

        // let aType = "channel.subscription.message"
        let aType = "channel.subscription.message"
            // let aBroadcasterUserId = "737746654"

        const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.Access_Token,
            'Client-Id': this.Client_id
        });

        console.log('create subs with session id', aSessionId);

        console.log(headers);

        let body = JSON.stringify({
            "type": aType,
            "version": "1",
            "condition": {
                "broadcaster_user_id": this.BroadcasterUserId
            },
            "transport": {
                "method": "websocket",
                "session_id": aSessionId
            }
        })


        // console.log(body)

        fetch('https://api.twitch.tv/helix' + '/eventsub/subscriptions', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    "type": aType,
                    "version": "1",
                    "condition": {
                        "broadcaster_user_id": this.BroadcasterUserId
                    },
                    "transport": {
                        "method": "websocket",
                        "session_id": aSessionId
                    }
                })
            }).then((response) => response.json())
            .then(function(data) {

                if ((data.status >= 400) && (data.status <= 499)) {
                    console.error('Subscription error: ', data.status, ' error:',
                        data.error, data.message);
                } else {
                    console.log(JSON.stringify(data))
                        // console.log('Subscribed to', [sub.sub, data.total, data]);
                        // setSubID(sub.sub, app.channelID, data.data[0].id);
                }
            });

    }

    async getEvents() {


        const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.Token,
            'Client-Id': this.Client_id
        });

        let authorizeUrl = new URL(TWITCH_API_BASE_URL + '/subscriptions/events');
        authorizeUrl.search = new URLSearchParams([
            ['broadcaster_id', this.BroadcasterUserId]
        ]).toString();


        let response = await fetch(authorizeUrl, {
            method: 'GET',
            headers: headers,

        })




        if (response.status == 204) {
            return true
        } else {
            console.log(data.status)
            return false;
        }

    }


}