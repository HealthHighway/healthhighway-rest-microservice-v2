
import mongoose from 'mongoose';

export const groupSessionFilterSchema = new mongoose.Schema({
    abbr : { type : String },
    ranking : { type : Number, default : 0 }
}, {
    timestamps: true
})

export const GroupSessionFilterModel = mongoose.model('group-session-filters', groupSessionFilterSchema)
