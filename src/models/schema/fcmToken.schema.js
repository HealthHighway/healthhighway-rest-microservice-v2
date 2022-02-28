
import mongoose from 'mongoose';

export const fcmTokenSchema = new mongoose.Schema({
    fcmToken : { type : String },
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt : { type : Date, index : true },
    lastNotificationSendAt : { type : Date, index : true },
    lastNotificationClickedAt : { type : Date, index : true },
    totalNotificationSent : { type : [String] },
    userSegment : { type : String }
}, {
    timestamps: true
})

export const FcmTokenModel = mongoose.model('fcm-tokens', fcmTokenSchema)
