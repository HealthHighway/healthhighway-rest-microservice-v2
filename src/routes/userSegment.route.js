import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.util.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js";
import { UserSegmentModel } from "../models/schema/userSegment.schema.js";

var router = express.Router();

router.get("/", (req, res) => {
    res.send('Welcome to User Segment Home Route')
})

router.post("/allSegments", [
    body('page').exists().withMessage("page not found").isNumeric().withMessage("invalid page type"),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage("invalid limit type"),
], checkRequestValidationMiddleware, async (req, res) => {

    try {

        let {page, limit} = req.body;
        page=Number(page)
        limit=Number(limit)
        let userSegments = await UserSegmentModel
                                    .find()
                                    .skip( limit * (page-1) )
                                    .limit(limit)
                                    .lean()

        jRes(res, 200, userSegments)


    }catch(err){
        jRes(res, 400, err)
    }

})

router.post("/addSegment", [
    body('description').exists().withMessage("description not found").isString().withMessage("invalid description type"),
], checkRequestValidationMiddleware, async (req, res) => {

    try {

        let newUserSegment  = new UserSegmentModel({ description : req.body.description })

        await newUserSegment.save()

        jRes(res, 200, newUserSegment)


    }catch(err){
        jRes(res, 400, err)
    }

})

export default router;