
import mongoose from 'mongoose';

export const callbackSchema = new mongoose.Schema({
    name : { type : String },
    age : { type : String },
    query : { type : String },
    categories : { type : [String] },
    phoneNumber : { type : String },
    email : { type : String },
    profession : { type : String },
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    preferredTimeToCall : { type : String },
    createdAt : { type : Date, index : true }
}, {
    timestamps: true
})

export const CallbackModel = mongoose.model('callbacks', callbackSchema)
