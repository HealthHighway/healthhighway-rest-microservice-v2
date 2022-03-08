import express from "express";
import { jRes } from "../utils/response.util.js";

var router = express.Router();

router.get('/', function (req, res) {
    jRes(res, 200, 100)
})

export default router;