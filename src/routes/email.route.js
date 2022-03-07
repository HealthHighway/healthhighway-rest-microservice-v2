import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js";

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Email Home Route')
})

router.post("/", [
    body('name').exists().withMessage("name not found").isString().withMessage('invalid name type'),
    body('email').exists().withMessage("email not found").isString().withMessage('invalid email type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try {

        const authorToBeAdded = new AuthorModel({ 
            name : req.body.name,
            profilePhotoUrl : req.body.profilePhotoUrl
        })

        await authorToBeAdded.save()

        jRes(res, 200, authorToBeAdded)

    }catch(err){

        console.log(err)
        jRes(res, 400, err)

    }

})

export default router;