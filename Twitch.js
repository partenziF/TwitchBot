export class TwitchUser {
    id;
    login;
    display_name;
    type;
    broadcaster_type;
    description;
    profile_image_url;
    offline_image_url;
    view_count;
    email;
    created_at;

    constructor(data) {

        Object.assign(this, data);

    }

}
export class Twitch {

    Client_id;
    Access_Token;

    constructor(aAuthorization) {

        this.Client_id = aAuthorization.configure.client_id
        this.Access_Token = aAuthorization.configure.access_token
    }

    // https://dev.twitch.tv/docs/api/reference/#get-users

    async getUserInfoSync(aLoginName) {

        const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.Access_Token,
            'Client-Id': this.Client_id
        });


        let authorizeUrl = new URL('https://api.twitch.tv/helix' + '/users');
        authorizeUrl.search = new URLSearchParams([
            ['login', aLoginName]
        ]).toString();


        let response = await fetch(authorizeUrl, {
            method: 'GET',
            headers: headers,

        })

        let data = await response.json()



        if (response.status == 200) {

            return new TwitchUser(data.data[0])

        } else {
            console.error("Status:", response.status, " ", data.error)
            console.error("Message :", data.message)

            return false;
        }



    }


}