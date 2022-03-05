import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js";
import {SocialModel} from "../models/schema/social.schema.js"

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

export default router;