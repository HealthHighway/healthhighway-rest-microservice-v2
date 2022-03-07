
import mongoose from 'mongoose';

export const reviewSchema = new mongoose.Schema({
    problem : { type : String },
    appraisal : { type : String },
    rating : { type : Number },
    others : { type : String },
    sessionId : { type : mongoose.Schema.Types.ObjectId },
    userId : { type : mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt : { type : Date, index : true }
})

export const ReviewModel = mongoose.model('reviews', reviewSchema)
