import express from "express"
import { body, param } from "express-validator"
import { jRes } from "../utils/response.util.js"
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js"
import { NotificationModel } from '../models/schema/notification.schema'
import { FcmTokenModel } from '../models/schema/fcmToken.schema'
import { UserSegmentModel } from "../models/schema/userSegment.schema.js";
import {sendNotification} from "../utils/notification.util.js"

var router = express.Router();

router.get('/', function (req, res) {
    jRes(res, 200, "Welcome to Notification Home Route")
})

router.post("/sendNotificationToAll" [
    body('title').exists().withMessage("page not found").isNumeric().withMessage('invalid page type'),
    body('body').exists().withMessage("limit not found").isNumeric().withMessage('invalid limit type')
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const notification = new NotificationModel({
            title:req.body.title,
            body:req.body.body,
            clickToAction : req.body.clickToAction?req.body.clickToAction:"",
            createdAt : new Date().toISOString(),
            category : req.body.category?req.body.category:""
        })

        const fcmTokens = await FcmTokenModel.find().lean()
        const tokens = fcmTokens.map(obj => obj.fcmToken)
        while(tokens.length > 0){
            let splicedSection = tokens.splice(100)
            sendNotification([...splicedSection], req.body.title, req.body.body, "fcm_default_channel12321232", "1")
            tokens = splicedSection
        }

        await notification.save();
        jRes(res, 200, { sentNotification : notification })

    }catch(err){
        console.log(err);
        jRes(res, 400, err)
    }

})

router.post("/sendPersonalizedNotification",[
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('title').exists().withMessage("title not found").isString().withMessage("invalid title"),
    body('body').exists().withMessage("body not found").isString().withMessage("body should be string"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isFcmToken = await FcmTokenModel.findOne({ userId : req.body.userId })
        if(isFcmToken){
            const notification = new NotificationModel({
                title:req.body.title,
                body:req.body.body,
                clickToAction : req.body.clickToAction?req.body.clickToAction:"",
                createdAt : new Date().toISOString(),
                category : req.body.category?req.body.category:"",
                users : [req.body.userId]
            })
            sendNotification([isFcmToken.fcmToken], req.body.title, req.body.body, "fcm_default_channel12321232", "1")
            await FcmTokenModel
                    .updateOne(
                        { userId : req.body.userId }, 
                        {lastNotificationSendAt : new Date().toISOString(), $push : { notificationsSent : { title : req.body.title, body : req.body.body } } }
                    )
            
            await notification.save()
            
            jRes(res, 200, { sentNotification : notification })
        }else{
            jRes(res, 400, "fcm token with this userId does not exists")
        }

    }catch(err){
        jRes(res, 400, err)
    }

})


router.post("/sendBatchNotifications", [
    body('users').exists().withMessage("users not found").isArray().withMessage("invalid users"),
    body('title').exists().withMessage("title not found").isString().withMessage("invalid title"),
    body('body').exists().withMessage("body not found").isString().withMessage("body should be string")
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        
        let isUserIdsValid = true;
        req.body.users.forEach(elem => {
            if(!body(elem).isMongoId()){
                isUserIdsValid = false;
            }
        })

        if(!isUserIdsValid){
            jRes(res, 400, "users must be an array of MongoIds");
            return;
        }

        const notification = new NotificationModel({
            title:req.body.title,
            body:req.body.body,
            clickToAction : req.body.clickToAction?req.body.clickToAction:"",
            createdAt : new Date().toISOString(),
            category : req.body.category?req.body.category:"",
            users : req.body.users
        })

        const fcmTokens = await FcmTokenModel
                                .find({ userId : {$in : req.body.users} })
                                .lean()
        
        const tokens = fcmTokens.map(obj => obj.fcmToken)
        while(tokens.length > 0){
            let splicedSection = tokens.splice(100)
            sendNotification([...splicedSection], req.body.title, req.body.body, "fcm_default_channel12321232", "1")
            tokens = splicedSection
        }

        await notification.save()
        
        jRes(res, 200, { sentNotification : notification })

    }catch(err){
        jRes(res, 400, err)
    }

})

router.post("/sendNotificationToUserSegment", [
    body('title').exists().withMessage("title not found").isString().withMessage("invalid title"),
    body('body').exists().withMessage("body not found").isString().withMessage("body should be string"),
    body('userSegment').exists().withMessage("userSegment not found").isMongoId().withMessage("userSegment should be string"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        
        const notification = new NotificationModel({
            title:req.body.title,
            body:req.body.body,
            clickToAction : req.body.clickToAction?req.body.clickToAction:"",
            createdAt : new Date().toISOString(),
            category : req.body.category?req.body.category:"",
            sentToSegment : req.body.userSegment
        })

        const fcmTokens = await FcmTokenModel.find({ userSegment : req.body.userSegment }).lean()
        const tokens = fcmTokens.map(obj => obj.fcmToken)
        while(tokens.length > 0){
            let splicedSection = tokens.splice(100)
            sendNotification([...splicedSection], req.body.title, req.body.body, "fcm_default_channel12321232", "1")
            tokens = splicedSection
        }

        await notification.save()

        jRes(res, 200, { sentNotification : notification })
    }catch(err){
        jRes(res, 400, err)
    }

})

router.post("/", [
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('page').exists().withMessage("page not found").isNumeric().withMessage('invalid page type'),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage('invalid limit type')
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        
        let {page, limit} = req.body
        page = Number(page)
        limit = Number(limit)

        const notifications = await NotificationModel
                                        .find({ $or : [{ users : {$exists : false} }, { users : {$size : 0} }, { users : { $all : [req.body.userId] } }] })
                                        .sort({ createdAt : -1 })
                                        .skip( limit * (page-1))
                                        .limit(limit)
                                        .lean()

        jRes(res, 200, notifications)

    }catch(err){
        console.log(err);
        jRes(res, 400, err)
    }

})

router.post("/", [
    body('page').exists().withMessage("page not found").isNumeric().withMessage('invalid page type'),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage('invalid limit type')
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        
        let {page, limit} = req.body
        page = Number(page)
        limit = Number(limit)

        const notifications = await NotificationModel
                                        .find()
                                        .sort({ createdAt : -1 })
                                        .skip( limit * (page-1))
                                        .limit(limit)
                                        .lean()

        jRes(res, 200, notifications)

    }catch(err){
        console.log(err);
        jRes(res, 400, err)
    }

})

export default router;