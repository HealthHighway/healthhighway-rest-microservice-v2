import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js";
import { sendSignUpMail, getFreeGroupSessionBookingMail, sendGroupSessionBookingMail, sendPrivateSessionBookingMail } from "../utils/email.util.js";

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Email Home Route')
})

router.post("/sendSignUpMail", [
    body('name').exists().withMessage("name not found").isString().withMessage('invalid name type'),
    body('email').exists().withMessage("email not found").isString().withMessage('invalid email type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try {
        sendSignUpMail(req.body.name, req.body.email)
        jRes(res, 200, authorToBeAdded)

    }catch(err){
        jRes(res, 400, err)
    }

})

router.post("/getFreeGroupSessionBookingMail", [
    body('name').exists().withMessage("name not found").isString().withMessage('invalid name type'),
    body('email').exists().withMessage("email not found").isString().withMessage('invalid email type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try {
        getFreeGroupSessionBookingMail(req.body.name, req.body.email)
        jRes(res, 200, authorToBeAdded)

    }catch(err){
        jRes(res, 400, err)
    }
})

router.post("/sendGroupSessionBookingMail", [
    body('name').exists().withMessage("name not found").isString().withMessage('invalid name type'),
    body('email').exists().withMessage("email not found").isString().withMessage('invalid email type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try {
        sendGroupSessionBookingMail(req.body.name, req.body.email)
        jRes(res, 200, authorToBeAdded)

    }catch(err){
        jRes(res, 400, err)
    }
})

router.post("/sendPrivateSessionBookingMail", [
    body('name').exists().withMessage("name not found").isString().withMessage('invalid name type'),
    body('email').exists().withMessage("email not found").isString().withMessage('invalid email type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try {
        sendPrivateSessionBookingMail(req.body.name, req.body.email)
        jRes(res, 200, authorToBeAdded)

    }catch(err){
        jRes(res, 400, err)
    }
})

export default router;