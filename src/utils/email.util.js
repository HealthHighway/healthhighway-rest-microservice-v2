import axios from 'axios';
import { sendClean } from "../config/server.config"
import { getSignUpMail } from '../templates/email/signup.js';
import { getFreeGroupSessionBookingMail } from '../templates/email/freeGroupSessionBooking.js';
import { getPaidGroupSessionBookingMail } from '../templates/email/paidGroupSessionBooking.js';
import { getPaidPrivateSessionBookingMail } from "../templates/email/paidPrivateSessionBooking.js";

const { url, owner_id, token, smtp_user_name, from_email, from_name } = sendClean;

export const sendSignUpMail = (c_name, c_email) => {
    let signUpMail;
    if(c_name == ""){
        signUpMail = getSignUpMail("Dear", "Yogi")
    }else{
        signUpMail = getSignUpMail(c_name.split(' ')[0], c_name.split(' ').length==1?"":c_name.split(' ')[1])
    }
    mailRequestHelper(signUpMail, `Welcome ${c_name!=''?c_name:"Yogi"}, Let's begin your journey with Health Highway`)
}

export const sendFreeSessionBookingMail = (c_name, c_email, ssn_name) => {
    let td = new Date();
    let freeSessionBookingMail;
    if(c_name == ""){
        freeSessionBookingMail = getFreeGroupSessionBookingMail("Dear", "Yogi", td.toString(), ssn_name);
    }else{
        freeSessionBookingMail = getFreeGroupSessionBookingMail(c_name.split(' ')[0], c_name.split(' ').length==1?"":c_name.split(' ')[1], td.toString(), ssn_name);
    }
    mailRequestHelper(freeSessionBookingMail, `Welcome ${c_name!=''?c_name:"Yogi"}, Your Trial Group Session has been booked`)
}

export const sendGroupSessionBookingMail = (c_name, c_email, ssn_name) => {
    let td = new Date();
    let groupSessionBookingMail;
    if(c_name == ""){
        groupSessionBookingMail = getPaidGroupSessionBookingMail("Dear", "Yogi", td.toString(), ssn_name)
    }else{
        groupSessionBookingMail = getPaidGroupSessionBookingMail(c_name.split(' ')[0], c_name.split(' ').length==1?"":c_name.split(' ')[1], td.toString(), ssn_name)
    }
    mailRequestHelper(groupSessionBookingMail, `Welcome ${c_name!=''?c_name:"Yogi"}, Your Group Session has been booked`)
}

export const sendPrivateSessionBookingMail = (c_name, c_email, ssn_name) => {
    let td = new Date();
    if(c_name == ''){
        privateSessionBookingMail = getPaidPrivateSessionBookingMail("Dear", "Yogi", td.toString(), ssn_name);
    }else{
        privateSessionBookingMail = getPaidPrivateSessionBookingMail(c_name.split(' ')[0], c_name.split(' ').length==1?"":c_name.split(' ')[1], td.toString(), ssn_name);
    }
    mailRequestHelper(privateSessionBookingMail, `Welcome ${c_name!=''?c_name:"Yogi"}, Your Personal Session has been successfully booked`)
}

const mailRequestHelper = (htmlContent, subject) => {
    axios({
        url,
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        data : {
            "owner_id": owner_id,
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
