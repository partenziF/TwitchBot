export class oAuth {

    client_id = ""
    client_secret = ""


    constructor(aClient_id, aClient_secret) {
        this.client_id = aClient_id
        this.client_secret = aClient_secret
    }

    async getToken() {

        let response = await fetch(
            "https://id.twitch.tv/oauth2/token", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: new URLSearchParams([
                    ['client_id', this.client_id],
                    ['client_secret', this.client_secret],
                    ['grant_type', 'client_credentials']
                ])
            }
        );

        if (response.status != 200) {
            throw new Error("Risposta dal server :" + response.status)
            return;
        }

        // oAuth dance success!
        let token = await response.json();
        return token.access_token

    }

    async validate(token) {


        let response = await fetch(
            "https://id.twitch.tv/oauth2/validate", {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + token
                },
            }
        );

        // console.log(response.status)

        if (response.status != 200) {
            throw new Error("Risposta dal server :" + response.status)
            return false;
        }

        let body = await response.json();

        if (body.expires_in <= 3600) {
            // console.log('Token is Ok but less than an hour left on it, will make a new one');

            return 0

        } else {
            // it"s ok
            let hours = Math.floor(body.expires_in / 3600);
            // console.log(`Token is Ok! Has ${hours} hours left`);
            return hours
        }

        console.log(body)

        return true;

    }


}