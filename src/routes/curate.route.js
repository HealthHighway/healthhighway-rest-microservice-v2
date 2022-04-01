import express from "express"
import { body, param } from "express-validator"
import { jRes } from "../utils/response.util.js"
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js"
import {CurateModel} from "../models/schema/curate.schema.js"
import {UserModel} from "../models/schema/user.schema.js"
import {FcmTokenModel} from "../models/schema/fcmToken.schema.js"
import {sendNotification} from "../utils/notification.util.js"

var router = express.Router()

router.get('/', function (req, res) {
    res.send('Welcome to Curate Home Route')
})

router.post("/", [
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('title').exists().withMessage("title not found").isString().withMessage("title should be string"),
    body('description').exists().withMessage("description not found").isString().withMessage("description should be string"),
    body('thumbnailImage').exists().withMessage("thumbnailImage not found").isString().withMessage("thumbnailImage should be string"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const { title, description, userId, thumbnailImage } = req.body
        let newCurate = new CurateModel({
            title,
            description,
            thumbnailImage,
            userId,
            createdAt : new Date().toISOString()
        })

        await newCurate.save()

        let fcmData = await FcmTokenModel.findOne({ userId : req.body.userId }).populate('userId')
        
        // if gmailAddress exists, then send mail

        // send notification
        if(fcmData && fcmData.fcmToken){
            sendNotification([fcmData.fcmToken], `Hi ${fcmData.userId.name}, here is a Session for you`, "Checkout the Session Curated for You!!!", "fcm_default_channel12321232", "1")
        }

        jRes(res, 200, newCurate)
    }catch(err){
        jRes(res, 400, err)
    }

})

router.get("/:userId/:page/:limit", [
    param('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    param('page').exists().withMessage("page not found").isNumeric().withMessage("invalid page"),
    param('limit').exists().withMessage("limit not found").isNumeric().withMessage("invalid limit"),
], checkRequestValidationMiddleware, async (req, res) => {

    try {

        let {page, limit} = req.params
        let skip = Number(Number(limit) * (Number(page) - 1))

        const user = await UserModel.findOne({ _id : req.params.userId })

        if(!user.bio){
            jRes(res, 200, { status : 0 })
            return;
        }

        let curated = await CurateModel.find({ userId : req.params.userId })
                                    .skip(skip)
                                    .limit(Number(limit))
                                    .sort({ createdAt : -1 })
        jRes(res, 200, { status : curated.length==0?1:2, curated })

    }catch(err){
        jRes(res, 400, err)
    }

})

router.post("/admin", [
    body('page').exists().withMessage("page not found").isNumeric().withMessage("invalid page"),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage("invalid limit"),
], checkRequestValidationMiddleware, async (req, res) => {

    try {

        let {page, limit} = req.body
        let skip = Number(Number(limit) * (Number(page) - 1))

        let curated = await CurateModel.find({})
                                    .skip(skip)
                                    .limit(Number(limit))
                                    .sort({ createdAt : -1 })
        jRes(res, 200, curated)

    }catch(err){
        jRes(res, 400, err)
    }

})

export default router