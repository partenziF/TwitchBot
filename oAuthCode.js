import express from 'express';
import { resolve } from 'path';
import open from 'open'


const port = 3000
const TOKEN_REFRESH_SECONDS = 60 * 15

export class oAuthCode {

    client_id = ""
    client_secret = ""
    scope = []
    server = null
    succesfulLogged = null
    serverStarted = null
    token = null
    configure = null
    expires = 0
    isScopeChanged = false


    constructor(aConfigure, aScope) {

        this.configure = aConfigure;


        const newScope = this.configure.scope.reduce(
            (acc, item) => {
                return acc.includes(item) ? acc : [...acc, item]
            }, [...aScope]
        )

        let x = newScope.length;
        let x2 = this.configure.scope.length

        if ((x === x2) && (newScope.every((val, index) =>
                val === this.configure.scope[index]))) {
            this.isScopeChanged = false;
        } else {
            this.isScopeChanged = true
        }



        this.configure.scope = newScope;
        this.expires = 0

        // //aClient_id, aClient_secret, aScope
        // configure.scope.concat([
        //     'channel:read:subscriptions',
        //     'user:read:email'
        // ])

        // this.client_secret = aClient_secret
        // this.scope = aScope

        this.server = express()

        this.succesfulLogged = new Promise((resolve, reject) => {

            this.server.get('/', (req, res) => {

                // http://localhost:3000/
                // ?error=access_denied
                // &error_description=The+user+denied+you+access
                // &state=c3ab8aa609ea11e793ae92361f002671

                if (req.query.error == undefined) {
                    // console.log(req.query.code)
                    // console.log(req.query.scope)
                    resolve(req.query.code)

                } else {
                    reject(req.query.error, req.query.error_description)
                }

            })


        });

        this.serverStarted = new Promise((resolve, reject) => {

            this.server.listen(port, () => {
                ///console.log(`Example app listening on port ${port}`)
                resolve(true)
            })

        })

    }

    processMessage(request, res) {

        resolve(true);
        // console.log('code:', req.query.code)
        // console.log('scope:', req.query.scope)

    }

    async getAuthorizationCodeSync() {

        await this.serverStarted

        let authorizeUrl = new URL('https://id.twitch.tv/oauth2/authorize');
        authorizeUrl.search = new URLSearchParams([
            ['client_id', this.configure.client_id],
            ['redirect_uri', 'http://localhost:3000'],
            ['response_type', 'code'],
            ['scope', this.configure.scope.join(" ")]
        ]).toString();

        // console.log(authorizeUrl.toString())

        await open(authorizeUrl.toString())

        return this.succesfulLogged

    }

    async getAccessTokenSync() {

        this.code = await this.getAuthorizationCodeSync()

        let response = await fetch(
            "https://id.twitch.tv/oauth2/token", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: new URLSearchParams([
                    ['client_id', this.configure.client_id],
                    ['client_secret', this.configure.client_secret],
                    ['code', this.code],
                    ['grant_type', 'authorization_code'],
                    ['redirect_uri', 'http://localhost:3000']
                ])
            }
        );

        if (response.status != 200) {
            //throw new Error("Risposta dal server :" + response.status)
            return false
        }

        // oAuth dance success!
        this.token = await response.json();

        this.configure.access_token = this.token.access_token
        this.configure.refresh_token = this.token.refresh_token
        this.configure.scope = this.token.scope
        this.expires = this.token.expires_in

        console.log("create new token ", this.configure.access_token, ' expires in ', this.expires)

        return true;

    }

    async validateTokenSync() {

        let response = await fetch(
            "https://id.twitch.tv/oauth2/validate", {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + this.configure.access_token
                },
            }
        );

        // console.log(response.status)

        if (response.status != 200) {
            // throw new Error("Risposta dal server :" + response.status)
            return false;
        }

        let data = await response.json();

        this.expires = data.expires_in

        console.log("validate token is valid ", this.configure.access_token, ' expires in ', this.expires)

        return true;

    }



    async refreshing() {

        if (await this.validateTokenSync()) {

            if (this.expires < TOKEN_REFRESH_SECONDS) {

                if (this.refreshTokenSync()) {

                    this.configure.write();

                } else {

                    if (await this.getAccessTokenSync()) {
                        this.configure.write();
                    } else {
                        throw new Error("Error while getting Token")
                    }

                }
            }

        } else {

            if (await this.getAccessTokenSync()) {
                this.configure.write();
            } else {
                throw new Error("Error while getting Token")
            }

        }



    }

    async connectSync() {

        console.log("Connect...")

        if ((this.configure.access_token == "") || (this.isScopeChanged)) {

            if (await this.getAccessTokenSync()) {

                this.configure.write();

            } else {

                throw new Error("Error while getting Token")

            }

        } else {

            this.refreshing()
            setInterval(() => { this.refreshing() }, TOKEN_REFRESH_SECONDS * 1000)

        }

    }

    async refreshTokenSync() {

        console.warn("refersh")

        let response = await fetch(
            "https://id.twitch.tv/oauth2/token", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: new URLSearchParams([
                    ['client_id', this.configure.client_id],
                    ['client_secret', this.configure.client_secret],
                    ['grant_type', 'refresh_token'],
                    ['refresh_token', this.configure.refresh_token]
                ])
            }
        );

        if (response.status != 200) {
            //throw new Error("Risposta dal server :" + response.status)
            return false
        }

        // oAuth dance success!
        this.token = await response.json();

        if (this.token.error == undefined) {

            this.configure.access_token = this.token.access_token
            this.configure.refresh_token = this.token.refresh_token
            this.configure.scope = this.token.scope
            this.expires = this.token.expires_in
            return true;

        } else {
            return false;
        }




    }


}