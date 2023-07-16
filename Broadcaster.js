export class Broadcaster {

    Client_id;
    Access_Token;
    BroadcasterUserId; // = "737746654"


    constructor(aAuthorization, aBroadcasterUserId) {

        // this.Client_id = aAuthorization.configure.client_id
        // this.Access_Token = aAuthorization.configure.access_token

        this.Client_id = aAuthorization.configure.client_id
        this.Access_Token = aAuthorization.configure.access_token
        this.BroadcasterUserId = aBroadcasterUserId


    }


    //https://dev.twitch.tv/docs/api/reference/#get-broadcaster-subscriptions
    async getSubscriptionsSync() {

        const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.Access_Token,
            'Client-Id': this.Client_id
        });


        let authorizeUrl = new URL('https://api.twitch.tv/helix' + '/subscriptions');
        authorizeUrl.search = new URLSearchParams([
            ['broadcaster_id', this.BroadcasterUserId]
        ]).toString();


        let response = await fetch(authorizeUrl, {
            method: 'GET',
            headers: headers,

        })

        let data = await response.json()



        if (response.status == 200) {
            console.log(JSON.stringify(data))

            return data
        } else {
            console.error("Status:", response.status, " ", data.error)
            console.error("Message :", data.message)

            return false;
        }



    }


}