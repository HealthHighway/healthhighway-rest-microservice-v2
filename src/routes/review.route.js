import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js";
import {ReviewModel} from "../models/schema/review.schema.js"
import { sendNotificationViaSubscribedChannel } from "../utils/notification.util.js";
import { fcmSubscribedChannels } from "../config/server.config.js";

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Review Home Route')
})

router.post("/", [
    body('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
    body('rating').exists().withMessage("rating not found").isNumeric().withMessage('invalid rating type')
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        await ReviewModel.insertOne({ ...req.body, createdAt : new Date().toISOString() })

        sendNotificationViaSubscribedChannel(fcmSubscribedChannels.ADMIN, `Review Posted`, `A user has posted a review`, "")

        jRes(res, 200, "Review Posted")
    }catch(err){
        jRes(res, 400, err)
    }
})

router.post("/", [
    body('page').exists().withMessage("page not found").isNumeric().withMessage('invalid page type'),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage('invalid limit type')
], checkRequestValidationMiddleware, async (req, res) => {

    try {

        let {page, limit} = req.body
        page = Number(page)
        limit = Number(limit)

        const reviews = await ReviewModel
                                .find({})
                                .sort({ createdAt : -1 })
                                .skip( limit * (page-1) )
                                .limit(limit)
                                .lean()

        jRes(res, 200, reviews)

    }catch(err){
        jRes(res, 400, err)
    }

})

export default router;