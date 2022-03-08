import { google } from "googleapis";
import axios from "axios";
import admin from "firebase-admin";

import {firebaseConfig} from "../config/firebase.config.js";

export const sendNotification = (fcmTokens, title, body, android_channel_id, badge) => {
    admin.messaging().sendToDevice(
        fcmTokens, 
        { data : {}, notification : {title, body, android_channel_id, badge}},
        { priority : "high" } 
    )
    .then((response) => {
        console.log('Successfully sent message:', response)
    })
    .catch((error) => {
        console.log(error)
    })
}



export const sendNotificationViaSubscribedChannel = (channel, title, body, image) => {
    const jwtClient = new google.auth.JWT(
        firebaseConfig.client_email,
        null,
        firebaseConfig.private_key,
        ["https://www.googleapis.com/auth/firebase.messaging"],
        null
    )
    try{
        jwtClient.authorize(async (err, tokens) => {
            if(err)
            {
                console.log(err) ;
            }else
            {
                const access_token = tokens.access_token;
                const data =  {
                    "message": {
                      "topic": channel,
                      "notification": {
                        "title": title,
                        "body": body,
                        "image" : image
                      }
                    }
                  }
                  try{
                    await axios({
                        method : "POST",
                        url : "https://fcm.googleapis.com/v1/projects/healthhighway-45963/messages:send",
                        headers : {
                            "Content-Type" : "application/json",
                            "Authorization" : "Bearer "+ access_token
                        },
                        data : JSON.stringify(data)
                    })
                }catch(err)
                {
                    console.log(err);
                }
            }
        })
    }catch(err)
    {
        console.log(err);
    }
}