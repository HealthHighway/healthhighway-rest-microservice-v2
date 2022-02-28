import { jRes } from './response.js';
import { validationResult } from 'express-validator';

export const checkRequestValidationMiddleware = (req, res, next) => {
    var validationErrors = validationResult(req);
    const isFailed = !validationErrors.isEmpty();
    if (isFailed) {
        jRes(res, 400, validationErrors.array())
    }
    else {
        next();
    }
}
