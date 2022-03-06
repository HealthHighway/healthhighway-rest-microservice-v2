
import mongoose from 'mongoose';

export const blogFilterSchema = new mongoose.Schema({
    abbr : { type : String },
    ranking : { type : Number, default : 0 }
}, {
    timestamps: true
})

export const BlogFilterModel = mongoose.model('blog-filters', blogFilterSchema)
