import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.util.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js";
import {SocialModel} from "../models/schema/social.schema.js"
import {UserModel} from "../models/schema/user.schema.js"
import fetch from 'node-fetch';
import fs from 'fs';
import AWS from 'aws-sdk';
import { AwsStorage, TEMP_BASE_PATH } from '../config/server.config.js';
import getStream from "into-stream";
import { getFileNameFromPath, getRandomFileName, uploadFileStreamOnS3ForSocial, uploadRecursively } from "../utils/upload.util.js";
import { saveFileInTemp } from "../utils/saveFile.util.js";

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Social Home Route')
})

router.get("/:socialId", [
    param('socialId').exists().withMessage("socialId not found").isMongoId().withMessage("invalid socialId")
], checkRequestValidationMiddleware, async (req, res) => {
    try
    {
        
        const social = await SocialModel.findOne({ _id : req.params.socialId })
        jRes(res, 200, social)

    }catch(err){
        jRes(res, 400, err)
    }
})

router.post("/addSocial", [
    body('_id').exists().withMessage("_id not found").isMongoId().withMessage('invalid _id type'),
    body('title').exists().withMessage("title not found").isString().withMessage('invalid title type'),
    body('description').exists().withMessage("description not found").isString().withMessage('invalid description type'),
    body('imageUrls').exists().withMessage("imageUrls not found").isArray().withMessage('invalid imageUrls type'),
    body('videoUrls').exists().withMessage("videoUrls not found").isArray().withMessage('invalid videoUrls type'),
    body('socialCategory').exists().withMessage("socialCategory not found").isString().withMessage('invalid socialCategory type'),
    body('categoryKeywords').exists().withMessage("categoryKeywords not found").isArray().withMessage('invalid categoryKeywords type'),
    body('redirectUrl').exists().withMessage("redirectUrl not found").isString().withMessage('invalid redirectUrl type'),
    body('authorName').exists().withMessage("authorName not found").isString().withMessage('invalid authorName type'),
    body('authorHandleName').exists().withMessage("authorHandleName not found").isString().withMessage('invalid authorHandleName type'),
    body('authorHandleUrl').exists().withMessage("authorHandleUrl not found").isString().withMessage('invalid authorHandleUrl type'),
    body('authorImageUrl').exists().withMessage("authorImageUrl not found").isString().withMessage('invalid authorImageUrl type'),
    body('createdAt').exists().withMessage("createdAt not found").isDate().withMessage('invalid createdAt type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try
    {   

        const isSocial = await SocialModel.findOne({ _id : req.body._id })

        if(isSocial){
            jRes(res, 400, "Social with this _id already present")
            return
        }

        const socialToBeInserted = await SocialModel({
            ...req.body,
            likes : Math.ceil(Math.random()*1000 + 1),
        })

        await socialToBeInserted.save()

        jRes(res, 200, socialToBeInserted)

    }catch(err){
        console.log(err)
        jRes(res, 400, err)
    }
    
})

router.post("/uploadImagesOnS3", [], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const newSocial = new SocialModel({})

        if(req.files && Object.values(req.files).length > 0){
            
            let listContainingUploadedImages = []
            await uploadRecursively(Object.values(req.files), 0, listContainingUploadedImages, `socials/images/${newSocial._id}`)
    
            jRes(res, 200, { _id : newSocial._id, listContainingUploadedImages })

        }else{

            jRes(res, 400, "req.files should be present")

        }
        
    }catch(err){

        console.log(err)
        jRes(res, 400, err)

    }

})

router.post("/", [
    body('page').exists().withMessage("page not found").isNumeric().withMessage("invalid page type"),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage("invalid limit type"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        let {page, limit} = req.body
        page = Number(page)
        limit = Number(limit)

        let mongoQuery = [{ $or : [ { isHidden : {$exists : false} }, { isHidden : { $eq : false } } ] }]

        if(req.body.searchQuery){
            mongoQuery.push({$text: { $search: req.body.searchQuery } })
        }

        if(req.body.categoryKeywords){
            mongoQuery.push({ categoryKeywords : { $all : req.body.categoryKeywords } })
        }

        const socials = await SocialModel
                                .find({ $and : mongoQuery })
                                .sort({ createdAt : -1 })
                                .skip( limit * (page-1) )
                                .limit(limit)
                                .lean()

        jRes(res, 200, socials)

    }catch(err){
        jRes(res, 400, err)
    }

})

router.post("/admin", [
    body('page').exists().withMessage("page not found").isNumeric().withMessage("invalid page type"),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage("invalid limit type"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        let {page, limit} = req.body
        page = Number(page)
        limit = Number(limit)

        let mongoQuery = []

        if(req.body.searchQuery){
            mongoQuery.push({$text: { $search: req.body.searchQuery } })
        }

        if(req.body.categoryKeywords){
            mongoQuery.push({ categoryKeywords : { $all : req.body.categoryKeywords } })
        }

        const socials = await SocialModel
                                .find({ $and : mongoQuery })
                                .sort({ createdAt : -1 })
                                .skip( limit * (page-1) )
                                .limit(limit)
                                .lean()

        jRes(res, 200, socials)

    }catch(err){
        console.log(err)
        jRes(res, 400, err);
    }

})

router.post("/getFeatured", [
    body('page').exists().withMessage("page not found").isNumeric().withMessage("invalid page type"),
    body('limit').exists().withMessage("limit not found").isNumeric().withMessage("invalid limit type"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        let {page, limit} = req.body
        page = Number(page)
        limit = Number(limit)

        let mongoQuery = [{ $or : [ { isHidden : {$exists : false} }, { isHidden : { $eq : false } } ] }, { isFeatured : true }]

        if(req.body.searchQuery){
            mongoQuery.push({$text: { $search: req.body.searchQuery } })
        }

        if(req.body.categoryKeywords){
            mongoQuery.push({ categoryKeywords : { $all : req.body.categoryKeywords } })
        }

        const socials = await SocialModel
                                .find({ $and : mongoQuery })
                                .sort({ createdAt : -1 })
                                .skip( limit * (page-1) )
                                .limit(limit)
                                .lean()

        jRes(res, 200, socials)

    }catch(err){
        console.log(err)
        jRes(res, 400, err);
    }

})

router.post("/toggleFeaturedStatus", [
    body('_id').exists().withMessage("_id not found").isMongoId().withMessage('invalid _id type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isSocialPresent = await SocialModel.findOne({ _id : req.body._id })

        if(isSocialPresent){

            await SocialModel.findOneAndUpdate({ _id : req.body._id }, { isFeatured : !isSocialPresent.isFeatured })

            jRes(res, 200, "Updated Social Featured Status")

        }else{
            jRes(res, 200, "No Such Social Present")
        }


    }catch(err){

        console.log(err)
        jRes(res, 400, err)

    }

})

router.post("/toggleHiddenStatus", [
    body('_id').exists().withMessage("_id not found").isMongoId().withMessage('invalid _id type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isSocialPresent = await SocialModel.findOne({ _id : req.body._id })

        if(isSocialPresent){

            await SocialModel.findOneAndUpdate({ _id : req.body._id }, { isHidden : !isSocialPresent.isHidden })

            jRes(res, 200, "Updated Social hidden Status")

        }else{
            jRes(res, 200, "No Such Social Present")
        }


    }catch(err){

        console.log(err)
        jRes(res, 400, err)

    }

})

router.get("/like/:socialId/:userId", [
    param('socialId').exists().withMessage("socialId not found").isMongoId().withMessage("invalid socialId"),
    param('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId")
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isUser = await UserModel.findOne({ _id : req.params.userId })

        if(!isUser){
            jRes(res, 400, "No such user present")
            return
        }

        if(isUser.likedSocials){
            if(isUser.likedSocials[req.params.socialId]){
                jRes(res, 400, "User has already liked the social")
                return;
            }else{
                isUser.likedSocials = { ...isUser.likedSocials, [req.params.socialId] : req.params.socialId }
            }
        }else{
            isUser.likedSocials = {}
            isUser.likedSocials = { ...isUser.likedSocials, [req.params.socialId] : req.params.socialId }
        }

        await UserModel.findOneAndUpdate({ _id : req.params.userId }, { likedSocials : isUser.likedSocials}, { new : true })
        await SocialModel.findOneAndUpdate({ _id : req.params.socialId }, { $inc : { likes : 1 } }, { new : true })

        jRes(res, 200, isUser)

       
    }catch(err){
        jRes(res, 400, err);
    }
})

router.get("/dislike/:socialId/:userId", [
    param('socialId').exists().withMessage("socialId not found").isMongoId().withMessage("invalid socialId"),
    param('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId")
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isUser = await UserModel.findOne({ _id : req.params.userId });

        if(!isUser){
            jRes(res, 400, "No such user present")
            return
        }

        if(isUser.likedSocials && isUser.likedSocials[req.params.socialId]){
            delete isUser.likedSocials[req.params.socialId]
        }else{
            jRes(res, 400, "User has not liked the social")
        }

        await UserModel.findOneAndUpdate({ _id : req.params.userId }, { likedSocials : isUser.likedSocials}, { new : true })
        await SocialModel.findOneAndUpdate({ _id : req.params.socialId }, { $inc : { likes : -1 } }, { new : true })

        jRes(res, 200, isUser)

    }catch(err){
        jRes(res, 400, err);
    }
})

export default router;