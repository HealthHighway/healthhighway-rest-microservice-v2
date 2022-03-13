import express from "express"
import { jRes } from "../utils/response.util.js"
import {UserModel} from '../models/schema/user.schema.js';
import { sendSignUpMail } from "../utils/email.util.js"
import { body, param } from "express-validator"
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js"
import { sendNotificationViaSubscribedChannel } from "../utils/notification.util.js"
import { fcmSubscribedChannels } from "../config/server.config.js"
import {userModelS} from "../models/user.model.js"


export const userController=async ()=>{
    [
        body('name').exists().withMessage("name not found").isString().withMessage("name should be string"),
        body('gmailAddress').exists().withMessage("gmailAddress not found").isString().withMessage("gmailAddress should be string"),
        body('profilePhotoUrl').exists().withMessage("profilePhotoUrl not found").isString().withMessage("profilePhotoUrl should be string"),
        body('lastEntryLocation').exists().withMessage("lastEntryLocation not found").isObject().withMessage("lastEntryLocation should be string"),
        body('lastEntryPoint').exists().withMessage("lastEntryPoint not found").isString().withMessage("lastEntryPoint should be string")
    ], checkRequestValidationMiddleware, async (req, res) => {
    
        try{
            
           
    
            const newUser= await userModelS();
    
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

export const Admin=async ()=>{
    [
        body('page').exists().withMessage("page not found").isNumeric().withMessage('invalid page type'),
        body('limit').exists().withMessage("limit not found").isNumeric().withMessage('invalid limit type')
    ], checkRequestValidationMiddleware, async function (req, res) {
    
        try{
    
            let {page, limit} = req.body
            page = Number(page)
            limit = Number(limit)
    
            const users = await UserModel
                                .find({})
                                .sort({ createdAt : -1 })
                                .skip( limit * (page-1) )
                                .limit(limit)
                                .lean()
    
            jRes(res, 200, users)
    
        }catch(err){
            jRes(res, 400, err);
        }
    }  
}