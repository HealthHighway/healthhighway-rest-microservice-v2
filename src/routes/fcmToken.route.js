import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js";
import {FcmTokenModel} from "../models/schema/fcmToken.schema.js"
import {sendNotification} from "../utils/notification.util.js"

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to FcmToken Home Route')
})

router.post("/addFcmToken", [
    body('fcmToken').exists().withMessage("fcmToken not found").isString().withMessage("fcmToken should be string"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isFcmToken = await FcmTokenModel.findOne({ fcmToken : req.body.fcmToken })
        
        if(isFcmToken){
            jRes(res, 400, "this fcmToken already present")
            return;
        }

        const newFcmToken = new FcmTokenModel({
            fcmToken : req.body.fcmToken,
            createdAt : new Date().toISOString(),
            lastUpdatedAt : new Date().toISOString()
        })

        jRes(res, 200, newFcmToken)
    }catch(err){
        jRes(res, 400, err)
    }

})

router.post("/updateFcmToken", [
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('fcmToken').exists().withMessage("fcmToken not found").isString().withMessage("fcmToken should be string"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const updatedFcmToken = await FcmTokenModel.findOneAndUpdate({ fcmToken : req.body.fcmToken }, { userId : req.body.userId, lastUpdatedAt : new Date().toISOString() }).populate("userId")

        if(!updatedFcmToken){
            jRes(res, 400, "no such fcmToken present")
            return;
        }

        if(!updatedFcmToken.userId){
            jRes(res, 400, "no such userId present")
            return;
        }

        jRes(res, 200, updatedFcmToken)
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

        const fcmTokens = await FcmTokenModel.find({}, { _id : 0 })
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
    body('body').exists().withMessage("body not found").isString().withMessage("body should be string"),
], checkRequestValidationMiddleware, (req, res) => {

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

export default router;