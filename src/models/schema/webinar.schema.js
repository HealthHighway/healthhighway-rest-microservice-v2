
import mongoose from 'mongoose';

const calendarSchema = new mongoose.Schema({
    startDateTime : { type : Date }
})

export const webinarSchema = new mongoose.Schema({
    redirectUrl : {type : String},
    title : {type : String},
    description : {type : String},
    webinarCalendar : [calendarSchema],
    currentStrength : {type : Number},
    thumbnailUrls : [String],
    price : { type : Number },
    currency : { type : String, default : "INR" },
    startingDate : { type : Date },
    hostOffsetFromGMT : {type : Number, default : 330}, // date offset of place where session is to hosted - date offset of GMT
    timeZone : {type : String, default : "India Standard Time"}, // timezone
}, {
    timestamps: true
})

export const WebinarModel = mongoose.model('webinars', webinarSchema)
