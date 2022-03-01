import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js";
import {BlogModel} from "../models/schema/blog.schema.js"
import {AuthorModel} from "../models/schema/author.schema.js"
import { getBlogPath } from "../utils/blog.util.js";
import { uploadRecursively } from "../utils/upload.util.js";

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Blog Home Route')
})

router.get("/:blogId", [
    param('blogId').exists().withMessage("blogId not found").isMongoId().withMessage("invalid blogId")
], checkRequestValidationMiddleware, async (req, res) => {
    
    try
    {
        const blog = await BlogModel.findOne({ path : req.params.blogId })

        const suggestions = await BlogModel.aggregate([
            { $match : { _id : { $ne : req.params.blogId } } },
            { $sample : { size : 2 } }
        ])

        jRes(res, 200, {blog, suggestions})

    }catch(err){
        console.log(err)
        jRes(res, 400, err)
    }

})

router.post("/addBlog", [
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
        const author = await AuthorModel.findOne({ _id : req.params.authorId })

        if(author){

            const { name, profilePhotoUrl } = author

            delete req.body.authorId
            const blogToBeInserted = await BlogModel({
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

        const blogs = await BlogModel
                                .find({ $and : mongoQuery })
                                .sort({ createdAt : -1 })
                                .skip( limit * (page-1) )
                                .limit(limit)
                                .lean()

        jRes(res, 200, blogs)

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

        const blogs = await BlogModel
                                .find({ $and : mongoQuery })
                                .sort({ createdAt : -1 })
                                .skip( limit * (page-1) )
                                .limit(limit)
                                .lean()

        jRes(res, 200, blogs)

    }catch(err){
        console.log(err)
        jRes(res, 400, err);
    }

})

router.post("/getBlogSuggestedPathAndId", [
    body('title').exists().withMessage("title not found").isString().withMessage('invalid title type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        let path = getBlogPath(req.body.title)
        const newBlog = new BlogModel({})

        jRes(res, 200, { path, _id : newBlog._id })

    }catch(err){

        console.log(err)
        jRes(res, 400, err)

    }

})

router.post("/uploadImagesOnS3", [
    body('path').exists().withMessage("path not found").isString().withMessage('invalid path type'),
    body('_id').exists().withMessage("_id not found").isMongoId().withMessage('invalid _id type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        if(req.files && req.files.length > 0){

            const { path, _id }  = req.body
    
            let isBlogWithGivenUrlPresent = await BlogModel.findOne({ path })
            
            let listContainingUploadedImages = []
            await uploadRecursively(Object.values(req.files), 0, listContainingUploadedImages, path, _id)
    
            jRes(res, 200, { path, _id : newBlog._id, isBlogWithGivenUrlPresent : isBlogWithGivenUrlPresent?true:false, listContainingUploadedImages })

        }else{

            jRes(res, 400, "req.files should be present")

        }
        
    }catch(err){

        console.log(err)
        jRes(res, 400, err)

    }

})

export default router;