
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
    isFeatured : { type : Boolean, index : true, default : false }, // can apply attribute pattern here
    isHidden : { type : Boolean, index : true, default : false }, // can apply attribute pattern here
//  decidingKeys : { type : [ { key : String, value : Boolean }] } // this way, adding additional keys each time we add another booltype won;t be requiring indexing 
    htmlContent : { type : String }
})

blogSchema.index({ categoryKeywords : "text", title : "text", previewText : "text" })

export const BlogModel = mongoose.model('blogs', blogSchema)
