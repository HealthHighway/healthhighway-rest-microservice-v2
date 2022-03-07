
import mongoose from 'mongoose';

export const fcmTokenSchema = new mongoose.Schema({
    fcmToken : { type : String },
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt : { type : Date, index : true },
    lastUpdatedAt : { type : Date, index : true },
    lastNotificationSentAt : { type : Date, index : true },
    lastNotificationClickedAt : { type : Date, index : true },
    notificationSentTillDate : { type : [String] },
    userSegment : { type : String }
})

export const FcmTokenModel = mongoose.model('fcm-tokens', fcmTokenSchema)
