import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.util.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js";
import {BannerModel} from "../models/schema/banner.schema.js"
import sizeOf from 'buffer-image-size'
import { getRandomFileName, uploadFileStreamOnS3 } from "../utils/upload.util.js"

var router = express.Router()

router.get('/', function (req, res) {
    res.send('Welcome to Banner Home Route')
})

router.get("/getAll", async (req, res) => {

    try{

        const banners = await BannerModel.find();
        jRes(res, 200, banners)

    }catch(err){
        jRes(res, 400, err)
    }
})

router.post("/addBanner", [
    body('redirectUrl').exists().withMessage("redirectUrl not found").isString().withMessage('invalid redirectUrl type'),
], checkRequestValidationMiddleware, async (req, res) => {

    try {

        if(req.files && req.files.banner){

            let isBannerImageWithProperDimensions = true

            let width = sizeOf(req.files.banner.data).width
            let height = sizeOf(req.files.banner.data).height

            if(width < 1920 || height < 1080 || (width*9 != height*16)){
                isBannerImageWithProperDimensions = false
            }

            if(isBannerImageWithProperDimensions){
                
                let fileName = `${getRandomFileName()}_${req.files.banner.name}`
                const uploadedUrl = await uploadFileStreamOnS3(req.files.banner.data, `banners/images/${fileName}`)
        
                const newBanner = new BannerModel({
                    imageUrl : uploadedUrl,
                    redirectUrl : req.body.redirectUrl
                })

                await newBanner.save()

                jRes(res, 200, newBanner)
                
            }
            else{
                jRes(res, 400, "image(s) not with advised dimensions")
            }

        }else{
            jRes(res, 400, "req.files.banner should be present")
        }

    }catch(err){

        console.log(err)
        jRes(res, 400, err)

    }

})

export default router;