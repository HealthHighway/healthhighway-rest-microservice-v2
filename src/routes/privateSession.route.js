import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.util.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js";
import {PrivateSessionModel} from "../models/schema/privateSession.schema.js"
import { giveDates } from "../utils/calendat.util.js";
import short from 'short-uuid'
import { sendPrivateSessionBookingMail } from "../utils/email.util.js";
import { sendNotificationViaSubscribedChannel } from "../utils/notification.util.js";
import { fcmSubscribedChannels } from "../config/server.config.js";
import { TrainerModel } from "../models/schema/trainer.schema.js";

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Private-Session Home Route')
})

router.post("/bookPrivateSession", [
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('problem').exists().withMessage("problem not found").isString().withMessage("invalid problem"),
    body('name').exists().withMessage("name not found").isString().withMessage("invalid name"),
    body('price').exists().withMessage("price not found").isNumeric().withMessage("invalid price"),
    body('sessionCount').exists().withMessage("sessionCount not found").isNumeric().withMessage("invalid sessionCount"),
    body('timeIn24HrFormat').exists().withMessage("timeIn24HrFormat not found").isString().withMessage("invalid timeIn24HrFormat"),
    body('days').exists().withMessage("days not found").isArray().withMessage("invalid days"),
    body('weight').exists().withMessage("weight not found").isString().withMessage("invalid weight"),
    body('height').exists().withMessage("height not found").isString().withMessage("invalid height"),
    body('age').exists().withMessage("age not found").isNumeric().withMessage("invalid age"),
    body('trainerGenderPreference').exists().withMessage("trainerGenderPreference not found").isString().withMessage("invalid trainerGenderPreference"),
    body('startingDate').exists().withMessage("startingDate not found").isDate().withMessage("invalid startingDate"),
    body('timeZone').exists().withMessage("timeZone not found").isString().withMessage("invalid timeZone"),
    body('frontEndOffset').exists().withMessage("frontEndOffset not found").isNumeric().withMessage("invalid frontEndOffset")
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isUser = await UserModel.findOne({ _id : req.body.userId })

        if(!isUser){
            jRes(res, 400, "no user with this id present")
            return
        }

        const { 
            problem, userId, price, sessionCount, timeIn24HrFormat, days, weight, height, age, trainerGenderPreference, startingDate, timeZone, frontEndOffset, name
        } = req.body;

        const schedule = giveDates(days, startingDate, timeIn24HrFormat, sessionCount, timeZone, frontEndOffset)

        const newPrivateSession = new PrivateSessionModel({
            problem, 
            price, 
            sessionCount, 
            timeIn24HrFormat, 
            days, 
            weight, 
            height,
            name, 
            startingDate, 
            age, 
            calendar : schedule,
            trainerGenderPreference,
            createdAt : new Date().toISOString(), 
            userId
        })

        await newPrivateSession.save()

        //send mail to user
        if(isUser.gmailAddress){
            sendPrivateSessionBookingMail(isUser.name, isUser.gmailAddress, `Regarding ${problem}`)
        }
        //send notification to admin
        sendNotificationViaSubscribedChannel(fcmSubscribedChannels.ADMIN, `A New Private Session Booking`, `A user named ${isUser.name} has booked a private session`, "")

        jRes(res, 200, newPrivateSession)

    }catch(err){
        jRes(res, 400, err)
    }

})

router.post("/assignTrainer", [
    body('trainerId').exists().withMessage("trainerId not found").isMongoId().withMessage("invalid trainerId"),
    body('privateSessionId').exists().withMessage("privateSessionId not found").isMongoId().withMessage("invalid privateSessionId")
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isTrainer = await TrainerModel.findOne({ _id : req.body.trainerId })

        if(!isTrainer){
            jRes(res, 400, "no trainer with this id present")
            return
        }

        const updatedPrivateSession = await PrivateSessionModel
                                                .findOneAndUpdate(
                                                    { _id : req.body.privateSessionId },
                                                    { trainerId : req.body.trainerId}
                                                )
                                                .populate("userId")

        if(updatedPrivateSession.trainerId == req.body.trainerId){
            jRes(res, 400, "this trainer is already assigned to this private session")
            return
        }

        jRes(res, 200, "Trainer Assignment successful")

    }catch(err){
        jRes(res, 400, err)
    }

})

router.post("/admin", [
    body('page').exists().withMessage("page not found").isNumeric().withMessage("invalid page type"),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage("invalid limit type"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        let {page, limit} = req.body
        page = Number(page)
        limit = Number(limit)

        const privateSessions = await PrivateSessionModel
                                .find()
                                .sort({ createdAt : -1 })
                                .skip( limit * (page-1) )
                                .limit(limit)
                                .lean()

        jRes(res, 200, privateSessions)

    }catch(err){
        console.log(err)
        jRes(res, 400, err);
    }

})


router.post("/user", [
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('page').exists().withMessage("page not found").isNumeric().withMessage("invalid page type"),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage("invalid limit type"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        let {page, limit} = req.body
        page = Number(page)
        limit = Number(limit)

        const privateSessions = await PrivateSessionModel
                                        .find({ userId : req.body.userId })
                                        .sort({ createdAt : -1 })
                                        .skip( limit * (page-1) )
                                        .limit(limit)
                                        .lean()

        jRes(res, 200, privateSessions)

    }catch(err){
        jRes(res, 400, err)
    }

})

export default router;