import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js";
import {UserModel} from "../models/schema/user.schema.js"
import {GroupSessionModel} from "../models/schema/groupSession.schema.js"
import {TrainerModel} from "../models/schema/trainer.schema.js"
import short from 'short-uuid'

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Group-Session Home Route')
})

router.get("/isThisGroupAlreadyBooked/:groupSessionId/:userId", [
    param('groupSessionId').exists().withMessage("groupSessionId not found").isMongoId().withMessage("invalid groupSessionId"),
    param('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        let isUser = await UserModel.findOne({ _id : req.params.userId })

        if(!isUser){
            jRes(res, 400, "no user with this id present")
            return
        }

        if(isUser.groupSessionsBooked && user.groupSessionsBooked[req.params.groupSessionId]) {
            jRes(res, 200, { isPresent : true })
        } else {
            jRes(res, 200, { isPresent : false })
        }

    }catch(err){
        console.log(err)
        jRes(res, 400, err)

    }
})

router.post("/", [
    body('trainerId').exists().withMessage("trainerId not found").isMongoId().withMessage("invalid trainerId"),
    body('tile').exists().withMessage("tile not found").isString().withMessage("invalid tile"),
    body('thumbnailImage').exists().withMessage("thumbnailImage not found").isString().withMessage("invalid thumbnailImage"),
    body('limitOfAttendies').exists().withMessage("limitOfAttendies not found").isNumeric().withMessage("invalid limitOfAttendies"),
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
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isTrainer = await TrainerModel.findOne({ _id : req.body.trainerId });

        if(!isTrainer){
            jRes(res, 400, "No such trainer exists")
            return;
        }

        const newSession = new GroupSessionModel({
            ...req.body,
            trainerName : isTrainer.name,
            videoCallChannelId : short.generate()
        })

        await newSession.save()

        jRes(res, 200, newSession)

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

        if(req.body.categoryKeywords){
            mongoQuery.push({ categoryKeywords : { $all : req.body.categoryKeywords } })
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

export default router;