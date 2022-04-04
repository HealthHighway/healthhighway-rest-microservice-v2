import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.util.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js";
import {UserModel} from "../models/schema/user.schema.js"
import {GroupSessionModel} from "../models/schema/groupSession.schema.js"
import {TrainerModel} from "../models/schema/trainer.schema.js"
import sizeOf from 'buffer-image-size'
import { getRandomFileName, uploadFileStreamOnS3 } from "../utils/upload.util.js"
import { giveDates } from "../utils/calendat.util.js";
import { sendFreeGroupSessionBookingMail, sendGroupSessionBookingMail } from "../utils/email.util.js";
import { sendNotificationViaSubscribedChannel } from "../utils/notification.util.js";
import { fcmSubscribedChannels } from "../config/server.config.js";
import { FreeSessionsToAvail } from '../constants/groupSession.constant.js'

var router = express.Router()

router.get('/', function (req, res) {
    res.send('Welcome to Group-Session Home Route')
})

router.post("/addGroupSession", [
    body('trainerId').exists().withMessage("trainerId not found").isMongoId().withMessage("invalid trainerId"),
    body('title').exists().withMessage("title not found").isString().withMessage("invalid title"),
    body('limitOfAttendies').exists().withMessage("limitOfAttendies not found").isNumeric().withMessage("invalid limitOfAttendies"),
    body('currentAttendies').exists().withMessage("currentAttendies not found").isNumeric().withMessage("invalid currentAttendies"),
    body('description').exists().withMessage("description not found").isString().withMessage("invalid description"),
    body('advisaryListForSession').exists().withMessage("advisaryListForSession not found").isArray().withMessage("invalid advisaryListForSession"),
    body('advisaryListAgainstSession').exists().withMessage("advisaryListAgainstSession not found").isArray().withMessage("invalid advisaryListAgainstSession"),
    body('benefits').exists().withMessage("benefits not found").isArray().withMessage("invalid benefits"),
    body('price').exists().withMessage("price not found").isNumeric().withMessage("invalid price"),
    body('currency').exists().withMessage("currency not found").isString().withMessage("invalid currency"),
    body('level').exists().withMessage("level not found").isString().withMessage("invalid level"),
    body('timeIn24HrFormat').exists().withMessage("timeIn24HrFormat not found").isString().withMessage("invalid timeIn24HrFormat"),
    body('days').exists().withMessage("days not found").isArray().withMessage("invalid days"),
    body('startingDate').exists().withMessage("startingDate not found").isDate().withMessage("invalid startingDate"),
    body('filters').exists().withMessage("filters not found").isArray().withMessage("invalid filters"),
    body('keywords').exists().withMessage("keywords not found").isString().withMessage("invalid keywords")
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        if(req.files && req.files.groupSessionThumbnail){

            let isGroupSessionThumbnailWithProperDimensions = true

            let width = sizeOf(req.files.groupSessionThumbnail.data).width
            let height = sizeOf(req.files.groupSessionThumbnail.data).height

            if(width < 1920 || height < 1080 || (width*9 != height*16)){
                isGroupSessionThumbnailWithProperDimensions = false
            }

            if(isGroupSessionThumbnailWithProperDimensions){
                
                let fileName = `${getRandomFileName()}_${req.files.groupSessionThumbnail.name}`
                const uploadedUrl = await uploadFileStreamOnS3(req.files.groupSessionThumbnail.data, `group-sessions/images/${fileName}`)
        
                const isTrainer = await TrainerModel.findOne({ _id : req.body.trainerId });

                if(!isTrainer){
                    jRes(res, 400, "No such trainer exists")
                    return;
                }

                const newSession = new GroupSessionModel({
                    ...req.body,
                    trainerName : isTrainer.name,
                    thumbnailImage : uploadedUrl
                })

                await newSession.save()

                jRes(res, 200, newSession)
                
            }
            else{
                jRes(res, 400, "image(s) not with advised dimensions")
            }

        }else{
            jRes(res, 400, "req.files.groupSessionThumbnail should be present")
        }

        

    }catch(err){
        jRes(res, 400, err)
    }   
})

router.post("/", [
    body('page').exists().withMessage("page not found").isNumeric().withMessage("invalid page type"),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage("invalid limit type"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        let {page, limit} = req.body
        page = Number(page)
        limit = Number(limit)

        let mongoQuery = [{ $or : [ { showOnPlatform : {$exists : false} }, { showOnPlatform : { $eq : true } } ] }]

        if(req.body.searchQuery){
            mongoQuery.push({$text: { $search: req.body.searchQuery } })
        }

        if(req.body.filters && Array.isArray(req.body.filters) && req.body.filters.length){
            mongoQuery.push({ filters : { $all : req.body.filters } })
        }

        if(req.body.timeRange && typeof req.body.timeRange == "object" && req.body.timeRange["min"] && req.body.timeRange["max"]){
            mongoQuery.push({ timeIn24HrFormat : { $gte : req.body.timeRange.min, $lte : req.body.timeRange.max } })
        }

        const groupSessions = await GroupSessionModel
                                .find({ $and : mongoQuery })
                                .sort({ createdAt : -1 })
                                .skip( limit * (page-1) )
                                .limit(limit)
                                .lean()

        jRes(res, 200, groupSessions)

    }catch(err){
        console.log(err)
        jRes(res, 400, err);
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

        let mongoQuery = [{ $or : [ { showOnPlatform : {$exists : false} }, { showOnPlatform : { $eq : true } } ] }]

        if(req.body.searchQuery){
            mongoQuery.push({$text: { $search: req.body.searchQuery } })
        }

        if(req.body.categoryKeywords){
            mongoQuery.push({ categoryKeywords : { $all : req.body.categoryKeywords } })
        }

        const groupSessions = await GroupSessionModel
                                .find({ $and : mongoQuery })
                                .populate('trainerId').populate('filters')
                                .sort({ createdAt : -1 })
                                .skip( limit * (page-1) )
                                .limit(limit)
                                .lean()

        jRes(res, 200, groupSessions)

    }catch(err){
        console.log(err)
        jRes(res, 400, err);
    }

})

router.get("/:groupSessionId", [
    param('groupSessionId').exists().withMessage("groupSessionId not found").isMongoId().withMessage("invalid groupSessionId"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const groupSession = await GroupSessionModel.findOne({ _id : req.params.groupSessionId })

        if(groupSession){
            jRes(res, 200, groupSession)
        }else{
            jRes(res, 400, "No such group session present")
        }

    }catch(err){

    }

})

router.get("/admin/getAllUsersEnrolled/:groupSessionId", [
    param('groupSessionId').exists().withMessage("groupSessionId not found").isMongoId().withMessage("invalid groupSessionId"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const users = await UserModel.find()
        const filtered_users = []
        users.forEach((user) => {
            if(user.groupSessionsBooked && user.groupSessionsBooked[req.params.groupSessionId]){
                filtered_users.push(user)
            }
        })

        jRes(res, 200, filtered_users)

    }catch(err){
        jRes(res, 400, err);
    }
    
})

router.post("/bookGroupSession", [
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('price').exists().withMessage("price not found").isNumeric().withMessage("invalid price"),
    body('groupSessionId').exists().withMessage("groupSessionId not found").isMongoId().withMessage("invalid groupSessionId"),
    body('sessionCount').exists().withMessage("sessionCount not found").isNumeric().withMessage("invalid sessionCount"),
    body('startingDate').exists().withMessage("startingDate not found").isDate().withMessage("invalid startingDate"),
    body('timeZone').exists().withMessage("timeZone not found").isString().withMessage("invalid timeZone"),
    body('frontEndOffset').exists().withMessage("frontEndOffset not found").isNumeric().withMessage("invalid frontEndOffset")
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const { userId, groupSessionId, sessionCount, startingDate, timeZone, frontEndOffset, price } = req.body

        const isGroupSession = await GroupSessionModel.findOne({ _id : groupSessionId })

        if(!isGroupSession){
            jRes(res, 400, "No Such Group Session exists")
            return
        }

        const isUser = await UserModel.findOne({ _id : userId })

        if(!isUser){
            jRes(res, 400, "No Such user exists")
            return
        }

        const schedule = giveDates(
                            isGroupSession.days, 
                            startingDate, 
                            isGroupSession.timeIn24HrFormat, 
                            sessionCount, 
                            timeZone, 
                            frontEndOffset,
                            { bookingDate : new Date().toISOString(), price : req.body.price }
                        )

        // if price == 0 => check if free session available, if not then return else book free session
        if(price == 0){
            if(isUser.freeSessionsAvailed >= FreeSessionsToAvail || !isGroupSession.availableForFreeEntry) {
                jRes(res, 400, "No Free Entry Available Now!!")
                return
            }else{
                if(isUser.groupSessionsBooked){
                    if(isUser.groupSessionsBooked.get(groupSessionId) == null){
                        isUser.groupSessionsBooked.set( groupSessionId, { session : groupSessionId, calendar : schedule } )
                    }else{
                        // A session already present cannot be booked as free session again
                        jRes(res, 400, "Cannot Re-Book Same Session")
                        return
                    }
                }else{
                    isUser.groupSessionsBooked = {}
                    isUser.groupSessionsBooked.set( groupSessionId, { session : groupSessionId, calendar : schedule } )
                }

                isUser.freeSessionsAvailed = isUser.freeSessionsAvailed + 1
                if(isUser.gmailAddress){
                    sendFreeGroupSessionBookingMail(isUser.name, isUser.gmailAddress, isGroupSession.title)
                }
                sendNotificationViaSubscribedChannel(fcmSubscribedChannels.ADMIN, `A Free Group Session Booked`, `User named ${isUser.name} has booked ${isGroupSession.title} session`, "")

                const updatedUser = await isUser.save()

                jRes(res, 200, updatedUser)
            }
        }else{
            // if price != 0 => book directly without any checks

            if(isUser.groupSessionsBooked){
                if(isUser.groupSessionsBooked.get(groupSessionId) == null){
                    isUser.groupSessionsBooked.set( groupSessionId, { session : groupSessionId, calendar : schedule } )
                }else{
                    const { calendar } = isUser.groupSessionsBooked.get(groupSessionId)
                    schedule.forEach(sch => {
                        calendar.push(sch)
                    })
                    isUser.groupSessionsBooked.set( groupSessionId, { session : groupSessionId, calendar } )
                }
            }else{
                isUser.groupSessionsBooked = {}
                isUser.groupSessionsBooked.set( groupSessionId, { session : groupSessionId, calendar : schedule } )
            }

            await GroupSessionModel.findOneAndUpdate({_id: groupSessionId}, { $inc: { currentAttendies : 1 }}, { new:true })

            if(isUser.gmailAddress){
                sendGroupSessionBookingMail(isUser.name, isUser.gmailAddress, isGroupSession.title)
            }
            sendNotificationViaSubscribedChannel(fcmSubscribedChannels.ADMIN, `A Paid Group Session Booked`, `User named ${isUser.name} has booked ${isGroupSession.title} session`, "")

            const updatedUser = await isUser.save()

            jRes(res, 200, updatedUser)
        }

    }catch(err){
        console.log(err)
        jRes(res, 400, err)
    }
})

router.post("/update", [
    body('groupSessionId').exists().withMessage("groupSessionId not found").isMongoId().withMessage("invalid groupSessionId"),
    body('trainerId').exists().withMessage("trainerId not found").isMongoId().withMessage("invalid trainerId"),
    body('title').exists().withMessage("title not found").isString().withMessage("invalid title"),
    body('limitOfAttendies').exists().withMessage("limitOfAttendies not found").isNumeric().withMessage("invalid limitOfAttendies"),
    body('currentAttendies').exists().withMessage("currentAttendies not found").isNumeric().withMessage("invalid currentAttendies"),
    body('description').exists().withMessage("description not found").isString().withMessage("invalid description"),
    body('advisaryListForSession').exists().withMessage("advisaryListForSession not found").isArray().withMessage("invalid advisaryListForSession"),
    body('advisaryListAgainstSession').exists().withMessage("advisaryListAgainstSession not found").isArray().withMessage("invalid advisaryListAgainstSession"),
    body('benefits').exists().withMessage("benefits not found").isArray().withMessage("invalid benefits"),
    body('price').exists().withMessage("price not found").isNumeric().withMessage("invalid price"),
    body('currency').exists().withMessage("currency not found").isString().withMessage("invalid currency"),
    body('level').exists().withMessage("level not found").isString().withMessage("invalid level"),
    body('timeIn24HrFormat').exists().withMessage("timeIn24HrFormat not found").isString().withMessage("invalid timeIn24HrFormat"),
    body('days').exists().withMessage("days not found").isArray().withMessage("invalid days"),
    body('startingDate').exists().withMessage("startingDate not found").isDate().withMessage("invalid startingDate"),
    body('filters').exists().withMessage("filters not found").isArray().withMessage("invalid filters"),
    body('keywords').exists().withMessage("keywords not found").isString().withMessage("invalid keywords")
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isGroupSession = await GroupSessionModel.findOne({ _id : req.body.groupSessionId });

        if(!isGroupSession){
            jRes(res, 400, "No such group session found");
            return;
        }

        const updatedGroupSession = await GroupSessionModel.findOneAndUpdate(
                                                                { _id : req.body.groupSessionId },
                                                                { ...req.body }
                                                            )
        jRes(res, 200, updatedGroupSession)

    }catch(err){
        console.log(err)
        jRes(res, 400, err)
    }

})

router.post("/sessionDataForUser", [
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('country').exists().withMessage("country not found").isString().withMessage('invalid country type'),
    body('groupSessionId').exists().withMessage("groupSessionId not found").isMongoId().withMessage("invalid groupSessionId"),
], checkRequestValidationMiddleware, async (req, res) => {

    try {

        const isGroupSession = await GroupSessionModel.findOne({ _id : req.body.groupSessionId })

        if(!isGroupSession){
            jRes(res, 400, "No Such Group Session Exists");
            return;
        }

        const isUser = await UserModel.findOne({ _id : req.body.userId })

        if(!isUser){
            jRes(res, 400, "No such User Exists");
            return;
        }

        if(isUser.freeSessionsAvailed < FreeSessionsToAvail && isGroupSession.availableForFreeEntry){
            jRes(
                    res, 
                    200, 
                    {
                        price : 0, 
                        currency : isGroupSession.pricing[req.body.country]?isGroupSession.pricing[req.body.country].currency:isGroupSession.pricing["DEFAULT"].currency,
                        isSessionAlreadyBooked : isUser.groupSessionsBooked && isUser.groupSessionsBooked[req.body.groupSessionId] ? true : false,
                        isSessionFull : isGroupSession.currentAttendies<isGroupSession.limitOfAttendies?false:true
                    }
                )
        }else{
            jRes(
                    res, 
                    200, 
                    { 
                        price : isGroupSession.pricing[req.body.country]?isGroupSession.pricing[req.body.country].value:isGroupSession.pricing["DEFAULT"].value, 
                        currency : isGroupSession.pricing[req.body.country]?isGroupSession.pricing[req.body.country].currency:isGroupSession.pricing["DEFAULT"].currency,
                        isSessionAlreadyBooked : isUser.groupSessionsBooked && isUser.groupSessionsBooked[req.body.groupSessionId] ? true : false,
                        isSessionFull : isGroupSession.currentAttendies<isGroupSession.limitOfAttendies?false:true
                    }
                )
        }

    }catch(err){
        console.log(err);
        jRes(res, 400, err)
    }

})

router.post("/toggleLikeDislike", [
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('groupSessionId').exists().withMessage("groupSessionId not found").isMongoId().withMessage("invalid groupSessionId"),
], checkRequestValidationMiddleware, async (req, res) => {

    try {
        // searching for whether groupSession exists or not makes api un-necessarily slow so commenting out

        const isUser = await UserModel.findOne({ _id : req.body.userId })

        if(!isUser){
            jRes(res, 400, "No such User Exists")
            return;
        }

        if(isUser.likedGroupSessions && isUser.likedGroupSessions[req.body.groupSessionId]){
            delete isUser[req.body.groupSessionId]
            await isUser.save()
            await GroupSessionModel.findOneAndUpdate({ _id : req.body.groupSessionId }, { likeCount : {$inc : -1} })
            jRes(res, 200, isUser)
        }else{
            isUser.likedGroupSessions[req.body.groupSessionId] = req.body.groupSessionId
            await isUser.save()
            await GroupSessionModel.findOneAndUpdate({ _id : req.body.groupSessionId }, { likeCount : {$inc : 1} })
            jRes(res, 200, isUser)
        }

    }catch(err){
        console.log(err)
        jRes(res, 400, err)
    }

})

export default router;