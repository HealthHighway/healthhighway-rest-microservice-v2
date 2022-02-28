
import mongoose from 'mongoose';

export const filterSchema = new mongoose.Schema({
    abbr : { type : String },
    ranking : { type : Number, default : 0 }
}, {
    timestamps: true
})

export const FilterModel = mongoose.model('filters', filterSchema)
