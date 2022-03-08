import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.util.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js";
import {BlogModel} from "../models/schema/blog.schema.js"
import {AuthorModel} from "../models/schema/author.schema.js"
import {UserModel} from "../models/schema/user.schema.js"
import { getBlogPath } from "../utils/blog.util.js";
import { truncate, uploadRecursively } from "../utils/upload.util.js";
import sizeOf from 'buffer-image-size'

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Blog Home Route')
})

router.get("/:blogId", [
    param('blogId').exists().withMessage("blogId not found").isMongoId().withMessage("invalid blogId")
], checkRequestValidationMiddleware, async (req, res) => {
    
    try
    {
        const blog = await BlogModel.findOne({ _id : req.params.blogId })

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
        const author = await AuthorModel.findOne({ _id : req.body.authorId })

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

        const isBlogWithGiven_idPresent = await BlogModel.findOne({ _id : req.body._id });

        if(isBlogWithGiven_idPresent){
            jRes(res, 400, "blog with this _id already present")
            return
        }

        if(req.files && Object.values(req.files).length > 0){

            let isAllWithProperDimensions = true

            Object.values(req.files).forEach(data => {

                let width = sizeOf(data.data).width
                let height = sizeOf(data.data).height

                console.log(width, height)
                if(width < 600 || truncate(width/height, 1) != 1.7){
                    isAllWithProperDimensions = false
                }

            })

            if(isAllWithProperDimensions){
                const { path, _id }  = req.body
    
                let isBlogWithGivenUrlPresent = await BlogModel.findOne({ path })
                
                let listContainingUploadedImages = []
                await uploadRecursively(Object.values(req.files), 0, listContainingUploadedImages, path, _id)
        
                jRes(res, 200, { path, _id : _id, isBlogWithGivenUrlPresent : isBlogWithGivenUrlPresent?true:false, listContainingUploadedImages })
            }
            else{
                jRes(res, 400, "image(s) not with advised dimensions")
            }
            

        }else{

            jRes(res, 400, "req.files should be present")

        }
        
    }catch(err){

        console.log(err)
        jRes(res, 400, err)

    }

})

router.post("/toggleFeaturedStatus", [
    body('_id').exists().withMessage("_id not found").isMongoId().withMessage('invalid _id type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isBlogPresent = await BlogModel.findOne({ _id : req.body._id })

        if(isBlogPresent){

            await BlogModel.findOneAndUpdate({ _id : req.body._id }, { isFeatured : !isBlogPresent.isFeatured })

            jRes(res, 200, "Updated Blog Featured Status")

        }else{
            jRes(res, 200, "No Such Blog Present")
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

        const isBlogPresent = await BlogModel.findOne({ _id : req.body._id })

        if(isBlogPresent){

            await BlogModel.findOneAndUpdate({ _id : req.body._id }, { isHidden : !isBlogPresent.isHidden })

            jRes(res, 200, "Updated Blog Hidden Status")

        }else{
            jRes(res, 200, "No Such Blog Present")
        }


    }catch(err){

        console.log(err)
        jRes(res, 400, err)

    }

})

router.get("/like/:blogId/:userId", [
    param('blogId').exists().withMessage("blogId not found").isMongoId().withMessage("invalid blogId"),
    param('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId")
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isUser = await UserModel.findOne({ _id : req.params.userId })

        if(!isUser){
            jRes(res, 400, "No such user present")
            return
        }

        if(isUser.likedBlogs){
            if(isUser.likedBlogs[req.params.blogId]){
                jRes(res, 400, "User has already liked the blog")
                return;
            }else{
                isUser.likedBlogs = { ...isUser.likedBlogs, [req.params.blogId] : req.params.blogId }
            }
        }else{
            isUser.likedBlogs = {}
            isUser.likedBlogs = { ...isUser.likedBlogs, [req.params.blogId] : req.params.blogId }
        }

        await UserModel.findOneAndUpdate({ _id : req.params.userId }, { likedBlogs : isUser.likedBlogs}, { new : true })
        await BlogModel.findOneAndUpdate({ _id : req.params.blogId }, { $inc : { likes : 1 } }, { new : true })

        jRes(res, 200, isUser)

       
    }catch(err){
        jRes(res, 400, err);
    }
})

router.get("/dislike/:blogId/:userId", [
    param('blogId').exists().withMessage("blogId not found").isMongoId().withMessage("invalid blogId"),
    param('userId').exists().withMessage("userId not found").isMongoId().withMessage("invalid userId")
], checkRequestValidationMiddleware, async (req, res) => {

    try{

        const isUser = await UserModel.findOne({ _id : req.params.userId });

        if(!isUser){
            jRes(res, 400, "No such user present")
            return
        }

        if(isUser.likedBlogs && isUser.likedBlogs[req.params.blogId]){
            delete isUser.likedBlogs[req.params.blogId]
        }else{
            jRes(res, 400, "User has not liked the blog")
        }

        await UserModel.findOneAndUpdate({ _id : req.params.userId }, { likedBlogs : isUser.likedBlogs}, { new : true })
        await BlogModel.findOneAndUpdate({ _id : req.params.blogId }, { $inc : { likes : -1 } }, { new : true })

        jRes(res, 200, isUser)

    }catch(err){
        jRes(res, 400, err);
    }
})

export default router;