
import mongoose from 'mongoose';

export const userSegmentSchema = new mongoose.Schema({
    description : { type : String }
})

export const UserSegmentModel = mongoose.model('user-segments', userSegmentSchema)
