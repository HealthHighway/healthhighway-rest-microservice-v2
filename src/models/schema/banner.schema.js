
import mongoose from 'mongoose';

export const bannerSchema = new mongoose.Schema({
    imageUrl : String,
    redirectUrl : String,
    isHidden : {type : Boolean, default : false},
    ranking : {type : Number, index : true}
})

export const BannerModel = mongoose.model('banners', bannerSchema)
