import express from "express"
import { jRes } from "../utils/response.util.js"
import {UserModel} from '../models/schema/user.schema.js';
import { sendSignUpMail } from "../utils/email.util.js"
import { body, param } from "express-validator"
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js"
import { sendNotificationViaSubscribedChannel } from "../utils/notification.util.js"
import { fcmSubscribedChannels } from "../config/server.config.js"



export const userController=async ()=>{
    [
        body('name').exists().withMessage("name not found").isString().withMessage("name should be string"),
        body('gmailAddress').exists().withMessage("gmailAddress not found").isString().withMessage("gmailAddress should be string"),
        body('profilePhotoUrl').exists().withMessage("profilePhotoUrl not found").isString().withMessage("profilePhotoUrl should be string"),
        body('lastEntryLocation').exists().withMessage("lastEntryLocation not found").isObject().withMessage("lastEntryLocation should be string"),
        body('lastEntryPoint').exists().withMessage("lastEntryPoint not found").isString().withMessage("lastEntryPoint should be string")
    ], checkRequestValidationMiddleware, async (req, res) => {
    
        try{
            
            const isUser = await UserModel
                                .findOneAndUpdate(
                                    { gmailAddress : req.body.gmailAddress },
                                    { lastEntryLocation : req.body.lastEntryLocation, lastEntryPoint : req.body.lastEntryPoint},
                                    { new : true }
                                )
    
            if(isUser){
                jRes(res, 200, isUser)
                return
            }
    
            const newUser = new UserModel({
                name : req.body.name,
                gmailAddress: req.body.gmailAddress,
                profilePhotoUrl : req.body.profilePhotoUrl,
                lastEntryLocation : req.body.lastEntryLocation,
                lastEntryPoint : req.body.lastEntryPoint,
                createdAt : new Date().toISOString()
            })
    
            await newUser.save()
    
            // send notification to admin
            sendNotificationViaSubscribedChannel(fcmSubscribedChannels.ADMIN, `A New Sign Up`, `A new user named ${newUser.name} has signed up via google oauth`, "")
            // send welcome mail to user
            sendSignUpMail(newUser.name, newUser.gmailAddress)
    
            jRes(res, 200, newUser)
    
        }catch(err){
            jRes(res, 400, err);
        }
    }
}