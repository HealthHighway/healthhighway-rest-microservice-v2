
import mongoose from 'mongoose';

export const privateSessionSchema = new mongoose.Schema({
    problem : { type : String }, 
    price : { type : Number }, 
    sessionCount : { type : Number }, 
    timeIn24HrFormat : { type : String }, 
    weekDays : { type : [String] }, 
    trainerId : { type: mongoose.Schema.Types.ObjectId, ref: 'trainers', index : true },
    videoCallChannelId : { type : String }, 
    weight : { type : String }, 
    height : { type : String },   
    age : { type : Number },  
    trainerGenderPreference : { type : String }, 
    calendar : [Object],
    createdAt : { type : Date, index : true },
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'users', index : true }
}, {
    timestamps: true
})

export const PrivateSessionModel = mongoose.model('private-sessions', privateSessionSchema)
