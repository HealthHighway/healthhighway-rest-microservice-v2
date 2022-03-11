
import mongoose from 'mongoose';

export const ttcSchema = new mongoose.Schema({
    title : String,
    location: {
        name : String,
        coordinates: Array
    },
    price : {
        actualPrice : Number,
        discountedPrice : Number,
        currency : String
    },
    description : String,
    summary : String,
    media : { 
        content : {
            thumbnail : String,
            url : String
        },
        thumbnail : String
    },
    dates : [{ startDate : Date, endDate : Date }],
    
})