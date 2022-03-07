import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js";
import {BannerModel} from "../models/schema/banner.schema.js"

var router = express.Router()

router.get('/', function (req, res) {
    res.send('Welcome to Banner Home Route')
})

router.post("/addBanner", [
    body('redirectUrl').exists().withMessage("redirectUrl not found").isString().withMessage('invalid redirectUrl type'),
    body('showOnHome').exists().withMessage("showOnHome not found").isString().withMessage('invalid showOnHome type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try {

        

    }catch(err){

        console.log(err)
        jRes(res, 400, err)

    }

})

export default router;