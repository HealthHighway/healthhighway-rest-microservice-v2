import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.util.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js";
import {FcmTokenModel} from "../models/schema/fcmToken.schema.js"
import {sendNotification, sendNotificationViaSubscribedChannel} from "../utils/notification.util.js"
import { fcmSubscribedChannels } from "../config/server.config.js";

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to FcmToken Home Route')
})

router.post("/upsertFcmToken", [
    body('fcmToken').exists().withMessage("fcmToken not found").isString().withMessage("fcmToken should be string"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const upsertedFcmToken = await FcmTokenModel
                                        .findOneAndUpdate(
                                            { fcmToken : req.body.fcmToken },
                                            { fcmToken : req.body.fcmToken, userId : req.body.userId, lastUpdatedAt : new Date().toISOString() },
                                            { new : true, upsert : true }
                                        )
        
        jRes(res, 200, upsertedFcmToken)

    }catch(err){
        jRes(res, 400, err)
    }

})

router.get("/admin/:page/:limit", [
    param('page').exists().withMessage("page not found").isNumeric().withMessage("invalid page"),
    param('limit').exists().withMessage("limit not found").isNumeric().withMessage("invalid limit")
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        
        let {page, limit} = req.body
        page = Number(page)
        limit = Number(limit)

        const fcmTokens = await FcmTokenModel
                                .find({})
                                .sort({ createdAt : -1 })
                                .skip( limit * (page-1) )
                                .limit(limit)
                                .populate("userId")

        jRes(res, 200, fcmTokens)

    }catch(err){
        console.log(err)
        jRes(res, 400, err)
    } 

})

router.post("/sendNotificationToAll", [
    body('title').exists().withMessage("title not found").isString().withMessage("invalid title"),
    body('body').exists().withMessage("body not found").isString().withMessage("body should be string"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const fcmTokens = await FcmTokenModel.find().lean()
        const tokens = fcmTokens.map(obj => obj.fcmToken)
        while(tokens.length > 0){
            let splicedSection = tokens.splice(100)
            sendNotification([...splicedSection], req.body.title, req.body.body, "fcm_default_channel12321232", "1")
            tokens = splicedSection
        }

        await FcmTokenModel
                .updateMany(
                    {}, 
                    {lastNotificationSendAt : new Date().toISOString(), $push : { notificationsSent : { title : req.body.title, body : req.body.body } } }
                )

        jRes(res, 200, {notificationSent : true})
    }catch(err){
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
            sendNotification([isFcmToken.fcmToken], req.body.title, req.body.body, "fcm_default_channel12321232", "1")
            await FcmTokenModel
                    .updateOne(
                        { userId : req.body.userId }, 
                        {lastNotificationSendAt : new Date().toISOString(), $push : { notificationsSent : { title : req.body.title, body : req.body.body } } }
                    )
            
            jRes(res, 200, {notificationSent : true})
        }else{
            jRes(res, 400, "fcm token with this userId does not exists")
        }

    }catch(err){
        jRes(res, 400, err)
    }

})

router.post("/sendBatchNotifications", [
    body('fcmTokens').exists().withMessage("fcmTokens not found").isArray().withMessage("invalid fcmTokens"),
    body('title').exists().withMessage("title not found").isString().withMessage("invalid title"),
    body('body').exists().withMessage("body not found").isString().withMessage("body should be string")
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        sendNotification(req.body.fcmTokens, req.body.title, req.body.body, "fcm_default_channel12321232", "1")
        await FcmTokenModel
                .updateMany(
                    { fcmToken : { $in : req.body.fcmTokens } }, 
                    { lastNotificationSendAt : new Date().toISOString(), $push : { notificationsSent : { title : req.body.title, body : req.body.body } } }
                )
        
        jRes(res, 200, {notificationSent : true})

    }catch(err){
        jRes(res, 400, err)
    }

})

router.post("/sendNotificationToAdmin", [
    body('title').exists().withMessage("title not found").isString().withMessage("invalid title"),
    body('body').exists().withMessage("body not found").isString().withMessage("body should be string")
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        sendNotificationViaSubscribedChannel(fcmSubscribedChannels.ADMIN, req.body.title, req.body.body, "")
        jRes(res, 200, "Notification sent to Admin")
        
    }catch(err){
        jRes(res, 400, err)
    }

})

export default router;