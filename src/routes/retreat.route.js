import express from "express";
import { body, param } from "express-validator";
import { jRes } from "../utils/response.util.js";
import { checkRequestValidationMiddleware } from "../utils/requestValidator.util.js";

var router = express.Router();

router.get('/', function (req, res) {
    res.send('Welcome to Retreat Home Route')
})

export default router;