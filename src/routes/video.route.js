import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.util.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js";
import fs from 'fs';
import jwt from 'jsonwebtoken'
import { jaasConfig, JAAS_PRIVATE_KEY_PATH } from "../config/server.config.js";
var router = express.Router();

router.get('/', function (req, res) {
    jRes(res, 200, "Welcome to Video Home Route")
})

router.post("/getToken", [
    body('room').exists().withMessage("room not found").isString().withMessage('invalid room type'),
    body('username').exists().withMessage("username not found").isString().withMessage('invalid username type'),
    body('isModerator').exists().withMessage("isModerator not found").isBoolean().withMessage('invalid isModerator type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        const privateKey = fs.readFileSync(JAAS_PRIVATE_KEY_PATH, 'utf8');

        const token = jwt.sign({
            "aud": "jitsi",
            "exp": Math.floor(Date.now() / 1000) + (60 * 2 * 60),
            "nbf": Math.floor(Date.now() / 1000),
            "iss": "chat",
            "room": req.body.room,
            "sub": jaasConfig.APPID,
            "context": {
                "features": {
                "livestreaming": false,
                "outbound-call": false,
                "sip-outbound-call": false,
                "transcription": false,
                "recording": false
                },
                "user": {
                "moderator": req.body.isModerator,
                "name": req.body.username,
                "id": "",
                "avatar": "https://img.freepik.com/free-vector/guy-is-meditating-man-is-doing-yoga-icon-presentation-postcards-applications-yellow-blue-color-vetkor_174639-19977.jpg?w=740",
                "email": ""
                }
            }
            }, privateKey, {algorithm:"RS256",keyid:jaasConfig.APIKEY
        })
        
        jRes(res, 200, { token, room : req.body.room, username : req.body.username, appid : jaasConfig.APPID })
    }catch(err){
        console.log(err);
        jRes(res, 400, err)
    }

})

export default router;