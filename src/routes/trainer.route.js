import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.util.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js";
import {TrainerModel} from "../models/schema/trainer.schema.js"

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Trainer Home Route')
})

router.get("/:trainerId", [
    param('trainerId').exists().withMessage("trainerId not found").isMongoId().withMessage("invalid trainerId")
], checkRequestValidationMiddleware, async (req, res) => {

    try {

        const trainer = await TrainerModel.findOne({ _id : req.params.trainerId })

        jRes(res, 200, trainer)

    }catch(err){
        console.log(err);
        jRes(res, 400, err);
    }

})

router.post("/", [
    body('page').exists().withMessage("page not found").isNumeric().withMessage("page should be string"),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage("limit should be string")
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        let {page, limit} = req.body
        page = Number(page)
        limit = Number(limit)

        const trainers = await TrainerModel
                                .find({})
                                .skip( limit * (page-1) )
                                .limit(limit)

        jRes(res, 200, trainers)

    }catch(err){
        jRes(res, 400, err);
    }

})

router.post("/entryWithPhoneNumber",[
    body('phoneNumber').exists().withMessage("phoneNumber not found").isString().withMessage("phoneNumber should be string"),
    body('name').exists().withMessage("name not found").isString().withMessage("name should be string")
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isTrainer = await TrainerModel.findOne({ phoneNumber : req.body.phoneNumber })

        if(isTrainer){
            jRes(res, 200, isTrainer)
            return
        }

        const newTrainer = new TrainerModel({
            name : req.body.name,
            phoneNumber : req.body.phoneNumber
        })

        await newTrainer.save()

        jRes(res, 200, newTrainer)

    }catch(err){
        jRes(res, 400, err);
    }

})

export default router;