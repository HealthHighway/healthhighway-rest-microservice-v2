import express from 'express';
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import { SERVER_PORT, DATABASE_CONNECTION } from './config/server.config.js';
import fileUpload from 'express-fileupload';
import { registerAppRoutes } from './routes/index.js';
import { isReqAuthenticated } from "./utils/authenticate.util.js";

const mApplication = express();


mApplication.use(cors())
mApplication.use(express.json({ limit: '500mb'}));
mApplication.use(express.urlencoded({ limit: '50mb', extended: true }));
mApplication.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, 
}));
mApplication.use(isReqAuthenticated)

let mServer = http.createServer(mApplication);
mServer.listen(SERVER_PORT);


mServer.on('listening', () => {
    console.info(`Server started on  port ${SERVER_PORT} ---- connecting ${DATABASE_CONNECTION}`);
    mongoose.connect(DATABASE_CONNECTION);
});

/**
 * database connection settings
 */

mongoose.connection.on('error', function (err) {
    console.log('database connection error');
    console.log(err);
    process.exit(1);
}); // end mongoose connection error


mongoose.connection.on('open', async function (err) {
    if (err) {
        console.log("database error");
        console.log(err);
    }
    else {
        try {
            console.log("database connection open success");

            registerAppRoutes(mApplication);
        }
        catch (error) {
            console.log(error);
            process.exit(1);
        }
    }
});
