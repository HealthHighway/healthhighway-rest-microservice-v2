import express from "express"
import { body, param } from "express-validator"
import { jRes } from "../utils/response.js"
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js"
import {UserModel} from "../models/schema/user.schema.js"
import { sendNotificationViaSubscribedChannel } from "../utils/notification.util.js"
import { fcmSubscribedChannels } from "../config/server.config.js"
import { sendSignUpMail } from "../utils/email.util.js"

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to User Home Route')
})

router.get("/:userId", [
    param('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId")
], checkRequestValidationMiddleware, async (req, res) => {

    try {

        const user = await UserModel.findOne({ _id : req.params.userId })

        jRes(res, 200, user)

    }catch(err){
        console.log(err);
        jRes(res, 400, err);
    }

})

router.post("/entryWithGoogleOAuth", [
    body('name').exists().withMessage("name not found").isString().withMessage("name should be string"),
    body('gmailAddress').exists().withMessage("gmailAddress not found").isString().withMessage("gmailAddress should be string"),
    body('profilePhotoUrl').exists().withMessage("profilePhotoUrl not found").isString().withMessage("profilePhotoUrl should be string"),
    body('lastEntryLocation').exists().withMessage("lastEntryLocation not found").isObject().withMessage("lastEntryLocation should be string"),
    body('lastEntryPoint').exists().withMessage("lastEntryPoint not found").isString().withMessage("lastEntryPoint should be string")
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        
        const isUser = await UserModel
                            .findOneAndUpdate(
                                { gmailAddress : req.body.gmailAddress },
                                { lastEntryLocation : req.body.lastEntryLocation, lastEntryPoint : req.body.lastEntryPoint},
                                { new : true }
                            )

        if(isUser){
            jRes(res, 200, isUser)
            return
        }

        const newUser = new UserModel({
            name : req.body.name,
            gmailAddress: req.body.gmailAddress,
            profilePhotoUrl : req.body.profilePhotoUrl,
            lastEntryLocation : req.body.lastEntryLocation,
            lastEntryPoint : req.body.lastEntryPoint,
            createdAt : new Date().toISOString()
        })

        await newUser.save()

        // send notification to admin
        sendNotificationViaSubscribedChannel(fcmSubscribedChannels.ADMIN, `A New Sign Up`, `A new user named ${newUser.name} has signed up via google oauth`, "")
        // send welcome mail to user
        sendSignUpMail(newUser.name, newUser.gmailAddress)

        jRes(res, 200, newUser)

    }catch(err){
        jRes(res, 400, err);
    }
})

router.post("/entryWithPhoneNumber", [
    body('phoneNumber').exists().withMessage("phoneNumber not found").isString().withMessage("phoneNumber should be string"),
    body('lastEntryLocation').exists().withMessage("lastEntryLocation not found").isObject().withMessage("lastEntryLocation should be string"),
    body('lastEntryPoint').exists().withMessage("lastEntryPoint not found").isString().withMessage("lastEntryPoint should be string")
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        
        const isUser = await UserModel
                            .findOneAndUpdate(
                                { phoneNumber : req.body.phoneNumber },
                                { lastEntryLocation : req.body.lastEntryLocation, lastEntryPoint : req.body.lastEntryPoint},
                                { new : true }
                            )

        if(isUser){
            jRes(res, 200, isUser)
            return;
        }

        const newUser = new UserModel({
            phoneNumber : req.body.phoneNumber,
            lastEntryLocation : req.body.lastEntryLocation,
            lastEntryPoint : req.body.lastEntryPoint,
            createdAt : new Date().toISOString()
        })

        await newUser.save()

        // send notification to admin
        sendNotificationViaSubscribedChannel(fcmSubscribedChannels.ADMIN, `A New Sign Up`, `A new user named ${newUser.name} has signed up via phone number`, "")

        jRes(res, 200, newUser)

    }catch(err){
        jRes(res, 400, err);
    }
})

router.post("/addGoogleOAuth", [
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('gmailAddress').exists().withMessage("gmailAddress not found").isString().withMessage("gmailAddress should be string"),
    body('profilePhotoUrl').exists().withMessage("profilePhotoUrl not found").isString().withMessage("profilePhotoUrl should be string"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        
        const isUserAlreadyWithThisGoogleOAuth = await UserModel.findOne({ gmailAddress : req.body.gmailAddress })

        if(isUserAlreadyWithThisGoogleOAuth){
            if(isUserAlreadyWithThisGoogleOAuth._id == req.body.userId){
                jRes(res, 400, "user already has this gmail address")
            }else{
                jRes(res, 400, "different user with this gmail already exists")
            }
            return;
        }

        
        const updatedUser = await UserModel.findOneAndUpdate(
        {
            _id : req.body.userId
        },
        {
            gmailAddress: req.body.gmailAddress,
            profilePhotoUrl : req.body.profilePhotoUrl,
            
        }, 
        {
            new : true
        })

        if(!updatedUser){
            jRes(res, 400, "no user with this id present")
            return;
        }
        
        jRes(res, 200, updatedUser)

    }catch(err){
        jRes(res, 400, err);
    }
})

router.post("/addPhoneNumber", [
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('phoneNumber').exists().withMessage("phoneNumber not found").isString().withMessage("phoneNumber should be string"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        
        const isUserAlreadyWithThisPhoneNumber = await UserModel.findOne({ phoneNumber : req.body.phoneNumber })

        if(isUserAlreadyWithThisPhoneNumber){
            if(isUserAlreadyWithThisPhoneNumber._id == req.body.userId){
                jRes(res, 400, "this user already has the same phone number")
            }else{
                jRes(res, 400, "user with this phone number already exists")
            }
            return;
        }

        const updatedUser = await UserModel.findOneAndUpdate(
        {
            _id : req.body.userId
        },
        {
            phoneNumber : req.body.phoneNumber
        }, 
        {
            new : true
        })

        if(!updatedUser){
            jRes(res, 400, "no user with this id present")
            return;
        }

        jRes(res, 200, updatedUser)

    }catch(err){
        jRes(res, 400, err);
    }
})

router.post("/upsertName", [
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('name').exists().withMessage("name not found").isString().withMessage("name should be string"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const updatedUser = await UserModel.findOneAndUpdate(
        {
            _id : req.body.userId
        },
        {
            name : req.body.name
        }, 
        {
            new : true
        })

        if(!updatedUser){
            jRes(res, 400, "no user with this id present")
            return;
        }
        
        jRes(res, 200, updatedUser)

    }catch(err){
        jRes(res, 400, err)
    }
})

router.post("/upsertBio",[
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const updatedUser = await UserModel.findOneAndUpdate(
            { _id : req.body.userId },
            { bio : req.body.bio?req.body.bio : {} },
            { new : true }
        )

        if(!updatedUser){
            jRes(res, 400, "no user with this id present")
            return
        }

        // send notification to admin
        jRes(res, 200, updatedUser)

    }catch(err){
        jRes(res, 400, err)
    }

})

router.get("/getAllUpcomingSessions/:userId", [
    param('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isUser = await UserModel.findOne({ _id : req.params.userId })
        .populate('privateSessionsBooked')
        .populate('groupSessionsBooked.$*.session')
        .lean()

        if(!isUser){
            jRes(res, 400, "no user with this id present")
            return
        }

        const privateSessionsBooked = user.privateSessionsBooked;
        const groupSessionsBooked = user.groupSessionsBooked;

        let scheduledPrivateSessions = []
        let scheduledGroupSessions = []
        
        privateSessionsBooked && privateSessionsBooked.forEach(session => {

            for(let i=0; i<session.calendar.length; i++){

                let diff = new Date(session.calendar[i].fullDate) - new Date()
                if (diff < 24 * 60 * 60 * 1000 && diff > 0){

                    let scheduledTime = session.calendar[i].fullDate
                    delete session.calendar
                    scheduledPrivateSessions.push({...session, scheduledTime })
                    break;
                }
            }
        })
        
        groupSessionsBooked && Object.keys(groupSessionsBooked).forEach(ssnid => {

            let session = groupSessionsBooked[ssnid]
            for(let i=0; i<session.calendar.length; i++){

                let diff = new Date(session.calendar[i].fullDate) - new Date()
                if (diff < 24 * 60 * 60 * 1000 && diff > 0){

                    let scheduledTime = session.calendar[i].fullDate
                    delete session.calendar
                    scheduledGroupSessions.push({...session, scheduledTime })
                    break;
                }
            }
        })

        jRes(res, 200, { scheduledPrivateSessions, scheduledGroupSessions })

    }catch(err){
        console.log(err)
        jRes(res, 400, err)
    }
})

router.get("/getAllSessionsBookedYet/:userId", [
    param('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        
        const isUser = await UserModel.findOne({ _id : req.params.userId })
        .populate('privateSessionsBooked')
        .populate('groupSessionsBooked.$*.session')
        .lean()

        if(!isUser){
            jRes(res, 400, "no user with this id present")
            return
        }
        
        let privateSessionsBooked = isUser.privateSessionsBooked?isUser.privateSessionsBooked:[]
        let groupSessionsBooked = isUser.groupSessionsBooked?isUser.groupSessionsBooked:{}

        jRes(res, 200, { privateSessionsBooked,  groupSessionsBooked})

    }catch(err){
        console.log(err)
        jRes(res, 400, err)
    }
})

router.post("/admin/updateStatus", [
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('status').exists().withMessage("status not found").isString().withMessage("status should be string"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        let updatedUser = await UserModel.findOneAndUpdate(
            { _id : req.body.userId }, 
            { status : req.body.status }, 
            { new : true }
        )

        if(!updatedUser){
            jRes(res, 400, "no user with this id present")
            return
        }

        jRes(res, 200, updatedUser)

    }catch(err){
        jRes(res, 400, err)
    }

})

router.post('/admin', [
    body('page').exists().withMessage("page not found").isNumeric().withMessage('invalid page type'),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage('invalid limit type')
], checkRequestValidationMiddleware, async function (req, res) {

    try{

        let {page, limit} = req.body
        page = Number(page)
        limit = Number(limit)

        const users = await UserModel
                            .find({})
                            .sort({ createdAt : -1 })
                            .skip( limit * (page-1) )
                            .limit(limit)
                            .lean()

        jRes(res, 200, users)

    }catch(err){
        jRes(res, 400, err);
    }
})

// dummy changes1

export default router;