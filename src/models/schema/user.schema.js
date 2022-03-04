
import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema({
    email : { type : String },
    name : { type : String },
    phoneNumber : { type : String },
    bio : { type : Object },
    // privateSessionsBooked : [{ type: mongoose.Schema.Types.ObjectId, ref: 'private-sessions' }],
    freeSessionsAvailed : { type : Number }, //free sessions availed
    profilePhotoUrl : { type : String }, 
    groupSessionsBooked : {
        type : Map,
        of : {
            session : {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'group-sessions'
            },
            calendar : [Object]
        }
    },
    createdAt : {type : Date, index : true},
    status : { type : String },
    likedPosts : {
        type : Map,
        of : String,
    },
    // callbacks : [{ type: mongoose.Schema.Types.ObjectId, ref: 'callbacks' }],
    // webinars : [{ type: mongoose.Schema.Types.ObjectId, ref: 'webinars' }],
    // curates : [{ type: mongoose.Schema.Types.ObjectId, ref: 'curates' }]
}, {
    timestamps: true
})

export const UserModel = mongoose.model('users', userSchema)
