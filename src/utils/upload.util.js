import fs from 'fs';
import AWS from 'aws-sdk';
import { AwsStorage } from '../config/server.config.js';
import getStream from "into-stream";

const s3 = new AWS.S3({
    accessKeyId: AwsStorage.ACCESS_KEY,
    secretAccessKey: AwsStorage.SECRET_ACCESS_KEY,
});

export function getRandomFileName() {
    var timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    var random = ("" + Math.random()).substring(2, 8);
    var random_number = timestamp + random;
    return random_number;
}

export function uploadFileStreamOnS3(buffer, fileName)
{
    return new Promise(async (resolve, reject) =>
    {
        try
        {
            const params = {
                Bucket: AwsStorage.BUCKET_NAME,
                Key: "development/"+fileName,
                Body: getStream(buffer),
                ACL: "public-read",
            }

            s3.upload(params, (err, data) =>
            {
                if (err) {
                    reject(err)
                    return;
                }
                console.log("S3path ==>",data.Location)
                resolve(data.Location);
                return;
            });

        }
        catch (e) {
            reject(e);
        }
    });
}

