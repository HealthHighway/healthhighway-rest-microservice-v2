
import mongoose from 'mongoose';

export const socialSchema = new mongoose.Schema({
    title : { type : String },
    description : { type : String },
    imageUrls : { type : [String] },
    videoUrls : { type : [{videoUrl : String, thumbnailUrl : String}]},
    likes : { type : Number },
    socialCategory : { type : String, index : true}, // can be "LinkedIn || Instagram || Twitter || Facebook || Blogs",
    redirectUrl : { type : String },
    categoryKeywords : { type : [String] },
    authorName : { type : String },
    authorHandleName : { type : String },
    authorHandleUrl : { type : String },
    authorImageUrl : { type : String },
    createdAt : { type : Date, index : true },
    isFeatured : { type : Boolean, index : true, default : false },
    isHidden : { type : Boolean, index : true, default : false }
}, {
    timestamps: true
})

socialSchema.index({ categoryKeywords : "text", title : "text", description : "text" })

export const SocialModel = mongoose.model('socials', socialSchema)
