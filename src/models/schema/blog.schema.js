
import mongoose from 'mongoose';

export const blogSchema = new mongoose.Schema({
    title : { type : String},
    previewText : { type : String },
    thumbnailImage : { type : String },
    author : { type : String },
    authorImage : { type : String },
    categoryKeywords : { type : [String] },
    createdAt : {type : Date, index : true},
    path : {type : String, index : true},
    likes : { type : Number },
    isFeatured : { type : Boolean, index : true, default : false },
    isHidden : { type : Boolean, index : true, default : false },
    htmlContent : { type : String }
})

blogSchema.index({ categoryKeywords : "text", title : "text", previewText : "text" })

export const BlogModel = mongoose.model('blogs', blogSchema)
