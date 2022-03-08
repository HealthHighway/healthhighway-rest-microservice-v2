import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.util.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js";
import { GroupSessionFilterModel } from "../models/schema/groupSessionFilter.schema.js";
import { arraymove } from "../utils/filter.util.js";

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to GroupSessionFilter Home Route')
})

router.post("/", [
    body('abbr').exists().withMessage("abbr not found").isString().withMessage("abbr should be string"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isFilterPresent = await GroupSessionFilterModel({ abbr : req.body.abbr })

        if(isFilterPresent){
            jRes(res, 400, "This filter is already present")
            return
        }

        const newFilter = new GroupSessionFilterModel({ abbr : req.body.abbr })

        await newFilter.save()

        jRes(res, 200, newFilter)

    }catch(err){

    }
})

router.get("/", async (req, res) => {

    try {

        const filters = await GroupSessionFilterModel.find()

        let indexOfAll = filters.findIndex(filter => filter.abbr == "All")

        if(indexOfAll != -1){
            arraymove(filters, indexOfAll, 0)
        }

        jRes(res, 200, filters)

    }catch(err){
        jRes(res, 400, err)
    }

})

export default router;