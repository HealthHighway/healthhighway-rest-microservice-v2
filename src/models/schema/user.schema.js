
import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema({
    email : String,
    password : String,
    name : String,
    phoneNumber : String,
    bio : Object,
    privateSessionsBooked : [{ type: mongoose.Schema.Types.ObjectId, ref: 'private-sessions' }],
    gmailAddress : String,
    freeSessionsAvailed : {type : Number, default : 0},
    profilePhotoUrl : String, 
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
    status : String,
    likedGroupSessions : {
        type : Map,
        of : String
    },
    likedBlogs : {
        type : Map,
        of : String
    },
    likedSocials : Object,
    lastEntryLocation : Object,
    lastEntryPoint : String
    // callbacks : [{ type: mongoose.Schema.Types.ObjectId, ref: 'callbacks' }],
    // curates : [{ type: mongoose.Schema.Types.ObjectId, ref: 'curates' }]
}, {
    timestamps: true
})

export const UserModel = mongoose.model('users', userSchema)
