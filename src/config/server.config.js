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

export const jaasConfig = {
    APPID : "vpaas-magic-cookie-bd79ea6050dc45c5b41d0de18497018a",
    APIKEY : "vpaas-magic-cookie-bd79ea6050dc45c5b41d0de18497018a/2f0196",
    EMAIL_LINKED : "lancemate.tech2022@gmail.com",
    LIMIT_MAU : 25
}

const __dirname = path.resolve()

export const TEMP_BASE_PATH = path.join(__dirname, "/temp/")

export const JAAS_PRIVATE_KEY_PATH = path.join(__dirname, "/assets/jaas_private_key.pk")

export const fcmSubscribedChannels = {
    ADMIN : "healthhighway2020Admin",
    ALL : "ALL"
}