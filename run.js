// Load configuation
// import * as dotenv from 'dotenv';
// dotenv.config()

// const fs = require('fs');
// import * as fs from 'fs';

import { oAuthCode } from './oAuthCode.js';
import { SessionId } from './SessionId.js'
import { exit } from 'process';
import { Config } from './config.js'

import express from 'express';
import { EventSubcriber } from './EventSubscriber.js'

import { Broadcaster } from './Broadcaster.js'
import { Twitch } from './Twitch.js'


// const app = express()

// const promise = new Promise((resolve, reject) => {

//     app.get('/', (req, res) => {

//         console.log(req.query.code)
//         console.log(req.query.scope)
//         resolve(req.query.code)

//     })

// })

// app.listen(3000, () => {

//     console.log(`Example app listening on port 3000`)

//     let url = new URL('https://id.twitch.tv/oauth2/authorize');
//     url.search = new URLSearchParams([
//         ['client_id', c.client_id],
//         ['redirect_uri', 'http://localhost:3000'],
//         ['response_type', 'code'],
//         ['scope', 'channel:read:subscriptions']
//     ]).toString();

//     open(url.toString())


// })


// promise.then((code) => {
//     console.log("promessa:", code)
// })



let configure = new Config();
let authorization = new oAuthCode(configure, [
    "channel:read:subscriptions",
    'user:read:email'
])



await authorization.connectSync();


// moderator:read:followers	
let session = new SessionId();

// let isValidToken = false
// let maxAttempts = 10



let twitch = new Twitch(authorization)

let user = await twitch.getUserInfoSync('harleyTheQueer')


console.log(user)

let broadcaster = new Broadcaster(authorization, user.id)
    // broadcaster.getSubscriptionsSync()


let eventSubcriber = new EventSubcriber(authorization, user.id)

await eventSubcriber.getSubs();



session.onSubscribe = eventSubcriber.createSubs.bind(eventSubcriber)


session.onNotification = (sessionId, msg) => {
    console.log(JSON.stringify(msg))

    /*
    				if (type == 'channel.subscribe') {
    					outputHeadline.textContent = user + ' subscribed for the first time';
    					outputText.innerHTML = 'OMG TY so much!!';
    				}

    				// sub w/ msg
    				if (type == 'channel.subscription.message') {
    					const tier = message.payload.event.tier;
    					const months = message.payload.event.cumulative_months;
    					messageText = message.payload.event.message.text; // todo: emotes

    					if (parseInt(tier) > 1000) {
    						outputHeadline.textContent = user + ' resubscribed for ' + months + ' months at tier ' + tier;
    					} else {
    						outputHeadline.textContent = user + ' resubscribed for ' + months + ' months';
    					}

    					outputText.textContent = messageText;
    				}
*/

}

session.connect();