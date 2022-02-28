
import mongoose from 'mongoose';

export const corporateSchema = new mongoose.Schema({
    companyName : { type : String },
    location : { type : String },
    employeeCount : { type : Number },
    aim : { type : String },
    date : { type : Date, index : true },
    timeZone : { type : String },
    frontEndOffsetFromGMT : { type : Number },
    suitableTimings : { type : [String] },
    createdAt : { type : Date, index : true }
}, {
    timestamps: true
})

export const CorporateModel = mongoose.model('corporates', corporateSchema)
