
import mongoose from 'mongoose';

export const groupSessionSchema = new mongoose.Schema({
    trainerName : String,
    title : String, 
    videoCallChannelId : String, 
    trainerId : { type: mongoose.Schema.Types.ObjectId, ref: 'trainers' }, 
    thumbnailImage : String, 
    currentAttendies : Number, 
    limitOfAttendies : Number, 
    description : String, 
    advisaryListForSession : { type : [String] },
    advisaryListAgainstSession : { type : [String] },
    benefits : { type : [String] },
    level : String,
    showOnPlatform : { type : Boolean, default : true },
    timeIn24HrFormat : {type : String, index : true},
    minsPerSession : { type : Number, default : 50 },  
    days : { type : [String] },
    filters : { type : [mongoose.Schema.Types.ObjectId], index : true, ref: "blog-filters" },
    keywords : { type : String },
    freeDayCountFromSessionBooking : { type : Number, default : 2 }, // Number of Days from Booking a free trial that a person can take free trials
    startingDate : { type : Date },
    hostOffsetFromGMT : {type : Number, default : 330}, // date offset of place where session is to hosted - date offset of GMT
    timeZone : {type : String, default : "India Standard Time"},
    pricing : {type : Object},
    availableForFreeEntry : {type : Boolean, default : true}
}, {
    timestamps: true
})

groupSessionSchema.index({ title : "text", description : "text", advisaryListForSession : "text", advisaryListAgainstSession : "text", benefits : "text", keywords : "text" })

export const GroupSessionModel = mongoose.model('group-sessions', groupSessionSchema)
