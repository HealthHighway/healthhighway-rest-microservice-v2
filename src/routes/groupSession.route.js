import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js";
import {UserModel} from "../models/schema/user.schema.js"

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

export default router;