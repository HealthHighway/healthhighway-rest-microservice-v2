import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js";
import {CallbackModel} from "../models/schema/callback.schema.js"
import { sendNotificationViaSubscribedChannel } from "../utils/notification.util.js";
import { fcmSubscribedChannels } from "../config/server.config.js";

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Callback Home Route')
})

router.post("/", [
    body('name').exists().withMessage("name not found").isString().withMessage('invalid name type'),
    body('phoneNumber').exists().withMessage("phoneNumber not found").isString().withMessage('invalid phoneNumber type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        await CallbackModel.insertOne({ ...req.body, createdAt : new Date().toISOString() })

        sendNotificationViaSubscribedChannel(fcmSubscribedChannels.ADMIN, `Callback Scheduled`, `A user named ${req.body.name} has scheduled a callback`, "")

        jRes(res, 200, "Callback Scheduled")
    }catch(err){
        jRes(res, 400, err)
    }
})

router.post("/admin", [
    body('page').exists().withMessage("page not found").isNumeric().withMessage('invalid page type'),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage('invalid limit type')
], checkRequestValidationMiddleware, async (req, res) => {

    try {

        let {page, limit} = req.body
        page = Number(page)
        limit = Number(limit)

        const callbacks = await CallbackModel
                                .find({})
                                .sort({ createdAt : -1 })
                                .skip( limit * (page-1) )
                                .limit(limit)
                                .lean()

        jRes(res, 200, callbacks)

    }catch(err){
        jRes(res, 400, err)
    }

})

export default router;