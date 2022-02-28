import { AUTH_CONFIG } from "../config/server.config.js";

export const isReqAuthenticated = (req, res, next) => {

    let authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader("WWW-Authenticate", "Basic");
        res.status(401).send({ Access: "Not Allowed" });
    } else {
        let auth = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":")
        // console.log(auth)
        if (auth[0] == AUTH_CONFIG.username && auth[1] == AUTH_CONFIG.password) {
            next();
        } else {
            res.setHeader("WWW-Authenticate", "Basic");
            res.status(401).send({ Access: "Not Allowed" });
        }
    }

}
