
import mongoose from 'mongoose';

export const curateSchema = new mongoose.Schema({
    title : { type : String },
    description : { type : String },
    thumbnailImage : { type : String },
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt : { type : Date, index : true }
}, {
    timestamps: true
})

export const CurateModel = mongoose.model('curates', curateSchema)
