
import mongoose from 'mongoose';

export const privateSessionSchema = new mongoose.Schema({
    problem : String, 
    price : Number, 
    sessionCount : Number, 
    timeIn24HrFormat : String, 
    days : [String], 
    trainerId : { type: mongoose.Schema.Types.ObjectId, ref: 'trainers', index : true },
    videoCallChannelId : String, 
    weight : String, 
    height : String,   
    age : Number,  
    name : String,
    trainerGenderPreference : String, 
    calendar : [Object],
    createdAt : { type : Date, index : true },
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'users', index : true }
}, {
    timestamps: true
})

export const PrivateSessionModel = mongoose.model('private-sessions', privateSessionSchema)
