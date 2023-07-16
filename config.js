import * as fs from 'fs';


export class Config {

    client_id;
    client_secret;
    access_token;
    refresh_token;
    scope;

    constructor() {

        this.client_id = ""
        this.client_secret = ""
        this.access_token = ""
        this.refresh_token = ""
        this.scope = [];

        try {

            if (fs.existsSync('./.env')) {

                const data = fs.readFileSync('./.env', 'utf8');


                Object.assign(this, JSON.parse(data));


                console.log(this)

                if (this.client_id == "") {
                    throw new Error("client_id is not defined, please check it out")
                }
                if (this.client_secret == "") {
                    throw new Error("client_secret is not defined, please check it out")
                }



            } else {
                fs.writeFileSync('./.env', JSON.stringify(this))
            }


        } catch (err) {
            throw new Error(err)
            exit;
        }


    }


    write() {
        if (fs.existsSync('./.env')) {

            fs.writeFileSync('./.env', JSON.stringify(this))

        }

    }

}