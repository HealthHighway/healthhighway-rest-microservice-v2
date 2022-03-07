
import mongoose from 'mongoose';

export const bannerSchema = new mongoose.Schema({
    imageUrl : String,
    redirectUrl : String,
    showOnHome : Boolean
})

export const BannerModel = mongoose.model('banners', bannerSchema)
