
import mongoose from 'mongoose';

export const groupSessionSchema = new mongoose.Schema({
    trainerName : { type : String },
    title : { type : String }, 
    videoCallChannelId : { type : String }, 
    trainerId : { type: mongoose.Schema.Types.ObjectId, ref: 'trainers' }, 
    thumbnailImage : { type : [String] }, 
    currentAttendies : { type : Number }, 
    limitOfAttendies : { type : Number }, 
    description : { type : String }, 
    advisaryListForSession : { type : [String] },
    advisaryListAgainstSession : { type : [String] },
    benefits : { type : [String] },
    price : { type : Number },
    currency : { type : String }, 
    level : { type : String },
    showOnPlatform : { type : Boolean, default : true }, // Whether we want to show a session to a user or not on platform
    timeIn24HrFormat : { type : String }, // 24 hour format to be used here
    durationPerSession : { type : Number },  
    weekDays : { type : [String] },
    categoryKeywords : { type : [mongoose.Schema.Types.ObjectId] },
    freeDayCountFromSessionBooking : { type : Number }, // Number of Days from Booking a free trial that a person can take free trials
    startingDate : { type : Date },
    hostOffsetFromGMT : {type : Number, default : 330}, // date offset of place where session is to hosted - date offset of GMT
    timeZone : {type : String, default : "India Standard Time"}, // timezone
}, {
    timestamps: true
})

export const GroupSessionModel = mongoose.model('group-sessions', groupSessionSchema)
