export const jRes = (res,statusCode, data) => {
    res.contentType = "application/json; charset=utf-8";
    res.statusCode = statusCode;
    res.send({data});
}
