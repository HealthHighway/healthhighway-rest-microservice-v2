import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.util.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js";
import { sendSignUpMail, sendFreeGroupSessionBookingMail, sendGroupSessionBookingMail, sendPrivateSessionBookingMail } from "../utils/email.util.js";

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
        jRes(res, 200, "Mail Queued")

    }catch(err){
        console.log
        jRes(res, 400, err)
    }

})

router.post("/sendFreeGroupSessionBookingMail", [
    body('name').exists().withMessage("name not found").isString().withMessage('invalid name type'),
    body('email').exists().withMessage("email not found").isString().withMessage('invalid email type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try {
        sendFreeGroupSessionBookingMail(req.body.name, req.body.email)
        jRes(res, 200, "Mail Queued")

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
        jRes(res, 200, "Mail Queued")

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
        jRes(res, 200, "Mail Queued")

    }catch(err){
        jRes(res, 400, err)
    }
})

export default router;