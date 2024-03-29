import axios from 'axios';
import { sendClean } from "../config/server.config.js"
import { getSignUpMail } from '../templates/email/signup.js';
import { getFreeGroupSessionBookingMail } from '../templates/email/freeGroupSessionBooking.js';
import { getPaidGroupSessionBookingMail } from '../templates/email/paidGroupSessionBooking.js';
import { getPaidPrivateSessionBookingMail } from "../templates/email/paidPrivateSessionBooking.js";

const { url, ownerId, token, smtp_user_name, from_email, from_name } = sendClean;

export const sendSignUpMail = (c_name, c_email) => {
    let signUpMail;
    if(c_name == ""){
        signUpMail = getSignUpMail("Dear", "Yogi")
    }else{
        signUpMail = getSignUpMail(c_name.split(' ')[0], c_name.split(' ').length==1?"":c_name.split(' ')[1])
    }
    mailRequestHelper(signUpMail, `Welcome ${c_name!=''?c_name:"Yogi"}, Let's begin your journey with Health Highway`, c_name, c_email)
}

export const sendFreeGroupSessionBookingMail = (c_name, c_email, ssn_name) => {
    let td = new Date();
    let freeSessionBookingMail;
    if(c_name == ""){
        freeSessionBookingMail = getFreeGroupSessionBookingMail("Dear", "Yogi", td.toString(), ssn_name);
    }else{
        freeSessionBookingMail = getFreeGroupSessionBookingMail(c_name.split(' ')[0], c_name.split(' ').length==1?"":c_name.split(' ')[1], td.toString(), ssn_name);
    }
    mailRequestHelper(freeSessionBookingMail, `Welcome ${c_name!=''?c_name:"Yogi"}, Your Trial Group Session has been booked`, c_name, c_email)
}

export const sendGroupSessionBookingMail = (c_name, c_email, ssn_name) => {
    let td = new Date();
    let groupSessionBookingMail;
    if(c_name == ""){
        groupSessionBookingMail = getPaidGroupSessionBookingMail("Dear", "Yogi", td.toString(), ssn_name)
    }else{
        groupSessionBookingMail = getPaidGroupSessionBookingMail(c_name.split(' ')[0], c_name.split(' ').length==1?"":c_name.split(' ')[1], td.toString(), ssn_name)
    }
    mailRequestHelper(groupSessionBookingMail, `Welcome ${c_name!=''?c_name:"Yogi"}, Your Group Session has been booked`, c_name, c_email)
}

export const sendPrivateSessionBookingMail = (c_name, c_email, ssn_name) => {
    let td = new Date();
    let privateSessionBookingMail;
    if(c_name == ''){
        privateSessionBookingMail = getPaidPrivateSessionBookingMail("Dear", "Yogi", td.toString(), ssn_name);
    }else{
        privateSessionBookingMail = getPaidPrivateSessionBookingMail(c_name.split(' ')[0], c_name.split(' ').length==1?"":c_name.split(' ')[1], td.toString(), ssn_name);
    }
    mailRequestHelper(privateSessionBookingMail, `Welcome ${c_name!=''?c_name:"Yogi"}, Your Personal Session has been successfully booked`, c_name, c_email)
}

const mailRequestHelper = (htmlContent, subject, c_name, c_email) => {
    axios({
        url,
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        data : {
            "owner_id": ownerId,
            "token": token,
            "smtp_user_name": smtp_user_name,
            "message": {
                "html": htmlContent,
                "text": htmlContent,
                "subject": subject,
                "from_email": from_email,
                "from_name": from_name,
                "to": [
                    {
                        "email": c_email,
                        "name": c_name!=''?c_name:"Dear Yogi",
                        "type": "to"
                    }
                ],
                "headers": {
                    "Reply-To": from_email,
                    "X-Unique-Id": "id"
                }
            }
        }
    })
    .then(res => console.log(res.data))
    .catch(err => console.error(err))
}
