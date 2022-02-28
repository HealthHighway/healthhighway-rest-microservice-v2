import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.js";

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Trainer Home Route')
})

export default router;