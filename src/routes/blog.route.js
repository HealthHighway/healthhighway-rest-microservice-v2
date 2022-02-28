import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js";

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Blog Home Route')
})

router.get("/:blogId", [
    param('blogId').exists().withMessage("blogId not found").isMongoId().withMessage("invalid blogId")
], checkRequestValidationMiddleware, async (req, res) => {
    
    try
    {
        let blog = await BlogModel.findOne({ url : req.params.bid })

        const randomSuggestions = await BlogModel.aggregate([
            { $match : { _id : { $ne : req.params.bid } } },
            { $sample : { size : 2 } }
        ])

        // const skip = Math.floor(Math.random() * total) + 1;
        // const suggestions = await BlogModel.find({}).skip(skip).limit(2).exec();
        jRes(res, 200, {blog, suggestions : randomSuggestions});
    }catch(err){
        console.log(err)
        jRes(res, 400, err)
    }

})

export default router;