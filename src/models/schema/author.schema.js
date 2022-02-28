
import mongoose from 'mongoose';

export const authorSchema = new mongoose.Schema({
    name : { type : String },
    profilePhotoUrl : { type : String }
})

export const AuthorModel = mongoose.model('authors', authorSchema)
