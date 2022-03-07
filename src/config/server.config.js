import path from 'path';

export const SERVER_PORT = process.env.PORT || 8001;

export const DATABASE_CONNECTION = "mongodb+srv://HealthHighway:healthhighway2020@cluster0.fgdnq.mongodb.net/healthhighway";

export const AUTH_CONFIG = {
    username : "f5UjzjG7uEs4r6rDdNFc",
    password : "u668rbQ38WjVB5H6aYPW"
}

export const AwsStorage = {
    ACCESS_KEY : "AKIA2EMRT2E5GQQY7ZNB",
    SECRET_ACCESS_KEY : "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",
    BUCKET_NAME : "healthhighway"
}

export const sendClean = {
    url : "https://api.us1-mta1.sendclean.net/v1.0/messages/sendMail",
    ownerId : "74629352",
    token : "mrd12iKftbo3TvI2QrZd",
    smtp_user_name : "smtp48815141",
    from_email : "info@healthhighway.co.in",
    from_name : "Health Highway",
}

const __dirname = path.resolve();
export const TEMP_BASE_PATH = path.join(__dirname, "/temp/")

export const fcmSubscribedChannels = {
    ADMIN : "ADMIN",
    ALL : "ALL"
}