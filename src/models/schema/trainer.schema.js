
import mongoose from 'mongoose';

export const trainerSchema = new mongoose.Schema({
    name : { type : String },
    phoneNumber : { type : String },
    privateSessionsAlloted : [{ type : mongoose.Schema.Types.ObjectId, ref : 'private-sessions' }],
    groupSessionsAlloted : [{ type : mongoose.Schema.Types.ObjectId, ref : 'group-sessions' }]
}, {
    timestamps: true
})

export const TrainerModel = mongoose.model('trainers', trainerSchema)
