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
import { getFileNameFromPath, getRandomFileName, uploadFileStreamOnS3ForSocial } from "../utils/upload.util.js";
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

// not completed yet
router.post("/addSocial", [
    body('_id').exists().withMessage("_id not found").isMongoId().withMessage('invalid _id type'),
    body('path').exists().withMessage("path not found").isString().withMessage('invalid path type'),
    body('title').exists().withMessage("title not found").isString().withMessage('invalid title type'),
    body('previewText').exists().withMessage("previewText not found").isString().withMessage('invalid previewText type'),
    body('thumbnailImage').exists().withMessage("thumbnailImage not found").isString().withMessage('invalid thumbnailImage type'),
    body('authorId').exists().withMessage("author not found").isMongoId().withMessage('invalid author type'),
    body('categoryKeywords').exists().withMessage("categoryKeywords not found").isArray().withMessage('invalid categoryKeywords type'),
    body('htmlContent').exists().withMessage("htmlContent not found").isString().withMessage('invalid htmlContent type'),
    body('createdAt').exists().withMessage("createdAt not found").isString().withMessage('invalid createdAt type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try
    {   
        // find the corresponding author
        const author = await AuthorModel.findOne({ _id : req.body.authorId })

        if(author){

            const { name, profilePhotoUrl } = author

            delete req.body.authorId

            const blogToBeInserted = await SocialModel({
                ...req.body,
                author : name,
                authorImage : profilePhotoUrl,
                likes : Math.ceil(Math.random()*1000 + 1)
            })

            await blogToBeInserted.save()

            jRes(res, 200, blogToBeInserted)

        }else{
            jRes(res, 400, "No Such Author Found")
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

const s3 = new AWS.S3({
    accessKeyId: AwsStorage.ACCESS_KEY,
    secretAccessKey: AwsStorage.SECRET_ACCESS_KEY,
});

// not completed yet
router.post("/uploadMediaOnS3", [
    body('url').exists().withMessage("url not found").isString().withMessage("invalid url type"),
], checkRequestValidationMiddleware, async (req, res) => {

    try{
        const fileName = `${getRandomFileName()}_${getFileNameFromPath(req.body.url)}`;
        const filePath = `${TEMP_BASE_PATH}/${fileName}`;
    
        const fileSaved = await saveFileInTemp(req.body.url, filePath)
        if (fileSaved) 
        {
            const s3Path = await uploadFileStreamOnS3ForSocial(filePath, `${fileName}`);
    
            console.log("this is a s3Path>>", s3Path)
            fs.unlink(filePath, function (err)
            {
                if (err) {
                    console.log("error on delete file::", err)
                    throw new Error("error on delete file")
                }
            })
        }
    }catch(err){
        console.log(err)
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