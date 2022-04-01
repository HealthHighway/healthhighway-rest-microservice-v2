
import mongoose from 'mongoose';

export const notificationSchema = new mongoose.Schema({
    title : {type : String},
    body : {type : String},
    users : { type : [mongoose.Schema.Types.ObjectId], index : true },
    clickToAction : {type : String},
    createdAt : { type : Date, index : true },
    category : {type : String},
    sentToSegment : { type: mongoose.Schema.Types.ObjectId, ref: 'user-segments' }
})

export const NotificationModel = mongoose.model('notifications', notificationSchema)
