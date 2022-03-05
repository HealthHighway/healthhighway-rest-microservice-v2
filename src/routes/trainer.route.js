import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js";
import {TrainerModel} from "../models/schema/trainer.schema.js"

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Trainer Home Route')
})

router.post("/entryWithPhoneNumber",[
    body('phoneNumber').exists().withMessage("phoneNumber not found").isString().withMessage("phoneNumber should be string"),
    body('name').exists().withMessage("name not found").isString().withMessage("name should be string")
], checkRequestValidationMiddleware, (req, res) => {

    try{

        const isTrainer = await TrainerModel.findOne({ phoneNumber : req.params.phoneNumber })

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