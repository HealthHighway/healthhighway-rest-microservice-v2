
import admin from "firebase-admin";

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