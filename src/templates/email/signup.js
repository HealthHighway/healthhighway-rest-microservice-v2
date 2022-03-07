export const getSignUpMail = (c_fname, c_lname) => {
    let html 
     = 
     `<!DOCTYPE html>
     <html lang="en">
     <head>
         <meta charset="UTF-8">
         <meta http-equiv="X-UA-Compatible" content="IE=edge">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <title>Template</title>
         <style>
             @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
         </style>
         <style>
             * {
                 margin: 0;
                 padding: 0;
             }
             
             body {
                 background-color: #ffffff;
             }
             
             table {
                 border-spacing: 0;
             }
             
             td {
                 padding: 0;
             }
             
             img {
                 border: 0;
             }
             
             .wrapper {
                 table-layout: fixed;
                 width: 100%;
             }
             
             .webkit {
                 max-width: 600px;
                 background-color: white;
             }
             
             .outer {
                 margin: 0 auto;
                 width: 100%;
                 max-width: 600px;
                 font-family: "Montserrat", sans-serif;
             }
             
             .h-rule {
                 background-color: #4CA9EE;
                 outline: none;
                 height: 2px;
                 margin: 1.5em auto;
                 width: 90%;
             }
             
             .template-btn {
                 display: inline-block;
                 text-align: center;
                 background-color: #4CA9EE;
                 text-decoration: none;
                 font-size: 15px;
                 color: white;
                 font-weight: 500;
                 padding: .5em 1em;
                 border-radius: 5px;
                 margin: 1em 0;
             }
             
             .temp-content {
                 font-size: 14px;
                 font-family: "Montserrat";
             }
             
             .footer {
                 margin-top: 2em;
             }
             
             @media screen and (max-width: 414px) {
                 .outer {
                     max-width: 300px !important;
                 }
                 .webkit {
                     max-width: 300px !important;
                     width: 100%;
                 }
                 .banner-img {
                     width: 90% !important;
                     object-fit: contain !important;
                     margin-bottom: -30px;
                 }
                 .banner-txt {
                     font-size: 14px !important;
                 }
                 .banner-logo {
                     width: 90% !important;
                     object-fit: contain !important;
                 }
                 .desktop-only {
                     display: none;
                 }
                 .temp-content {
                     font-size: 10px;
                 }
             }
             
             @media screen and (min-width: 414px) {
                 .mobile-only {
                     display: none;
                 }
                 .content-img {
                     width: 138px;
                     height: auto;
                 }
                 .usp-text {
                     font-size: 16px !important;
                 }
                 .heading {
                     font-size: 20px !important;
                 }
                 .paddingbottom {
                     padding-bottom: 2em !important;
                 }
             }
         </style>
     </head>
     
     <body>
         <center class="wrapper">
             <div class="webkit">
     
                 <table class="outer">
     
                     <!-- MObile banner -->
                     <tr class="mobile-only">
                         <td style="background-color: white; text-align: center; padding: 1em 0;width: 100%;">
                             <a href="https://www.healthhighway.co.in/"><img class="banner-logo" src="https://ik.imagekit.io/healthhighway2020/logo4x_BX5JMeKbVx.png?updatedAt=1635338113302" alt="health highway" title="health highway" style="  width: 159px;
                                     height: 25px; ;
                                     object-fit: cover; text-align: center;"></a>
                         </td>
                     </tr>
                     <tr class="mobile-only">
                         <td>
                             <table width="100%" style="border-spacing: 0;">
                                 <tr>
                                     <td style="background-color: #252525;text-align: center; padding-top: 1em;"><img class="banner-img" src="https://ik.imagekit.io/healthhighway2020/backgrounf-mail_6lsnnDBL3vQN.png?updatedAt=1635001175597" alt="welcome" style="margin: 0 auto;width: 60% !important; "></td>
                                 </tr>
                                 <tr>
                                     <td style="background-color: #252525; text-align: center;padding-bottom: 1em;">
                                         <h1 class="banner-txt" style="margin: 0; font-size: 14px ;font-weight: 600; color: white; line-height: 1.3;;">
                                             Welcome, <br> <span style="color: #4CA9EE;">${c_fname}</span> <span style="color: #29E7CD;">${c_lname}</span></h1>
                                     </td>
                                 </tr>
                             </table>
                         </td>
                     </tr>
     
    
                     <!-- Desktop banner -->
                     <tr class="desktop-only">
                         <td>
                             <table style="border-spacing: 0;width: 100%;">
     
     
                                 <tr>
                                     <td style="background-color: #252525; padding: 1em 0;padding-left: 4%;">
                                         <a href="https://www.healthhighway.co.in/"><img class="banner-logo" src="https://ik.imagekit.io/healthhighway2020/logo4x_BX5JMeKbVx.png?updatedAt=1635338113302" alt="health highway" title="health highway" style="  width: 159px;
                                             height: 25px; padding-bottom: 30px;
                                             object-fit: cover;"></a>
                                         <h1 class="banner-txt" style="margin: 0; font-size: 20px ;font-weight: 600; color: white; line-height: 1.3;">
                                             Welcome, <br> <span style="color: #4CA9EE;">${c_fname}</span> <span style="color: #29E7CD;">${c_lname}</span></h1>
                                     </td>
                                     <td style="background-color: #252525;text-align: right;"><img class="banner-img" src="https://ik.imagekit.io/healthhighway2020/welcome_png_KYn-esACE.png?updatedAt=1635336408198" alt="welcome" style=" width: 170px;height: auto; padding: 1em 0;padding-right: 5%;object-fit: contain;
                                         height: 97px; "></td>
                                 </tr>
     
                             </table>
                         </td>
                     </tr>
     
     
     
                     <!-- Content Table -->
                     <tr>
                         <td>
                             <table width="100%" style="border-spacing: 0;">
                                 <tr>
                                     <td>
                                         <h3 class="heading" style="color: #252525; text-align: center;   font-size: 18px;
                                         font-weight: 600;padding-top: 1em; "> "<span style="color: #4CA9EE;">Train</span> with the <span style="color: #29E7CD;">Best</span>" </h3>
                                     </td>
                                 </tr>
                                 <tr>
     
                                     <td style="padding: 1em 6%;">
                                         <p class="temp-content" style=" font-weight: 400; margin: 0;
                                            
                                             text-align: left;
                                             line-height: 1.5;">
                                             Yes, you have taken the right highway!
                                             <br>
                                             <br>Thank you for sharing your email address with us. From now on, you will be among the first ones to receive all the updates regarding the big Yoga events, special offers and healthy diet recommendations.
                                             <br>
                                             <br>
                                             <br>Your Health, Our Priority.
                                         </p>
                                     </td>
                                 </tr>
                             </table>
                         </td>
                     </tr>
                     <tr>
                         <td>
                             <div class="h-rule"></div>
                         </td>
                     </tr>
     
                     <tr>
                         <td class="paddingbottom">
                             <table width="100%" style="border-spacing: 0;">
                                 <tr>
                                     <td colspan="2" style="padding-bottom: 1em;">
                                         <h3 class="heading" style="color: #252525; font-size: 14px; font-weight: 500; text-align: center;">What's there in store for you?</h3>
                                     </td>
                                 </tr>
                                 <tr>
                                     <td style="padding: 1em 0; padding-left: 7%;width: 50%;     vertical-align: bottom;">
                                         <table width="100%" style="border-spacing: 0;">
                                             <tr>
                                                 <td style="text-align: center;"><img class="content-img" src="https://ik.imagekit.io/healthhighway2020/usp1_LMniFEJ7-.png?updatedAt=1635336635056" alt="" width="81"></td>
                                             </tr>
                                             <tr>
                                                 <td>
                                                     <p class="usp-text" style="font-size: 10px;
                                                 color: #252525;
                                                 font-weight: 500;
                                                 width: 100%;
                                                 text-align: center;padding-top: .5em;">Personalized sessions</p>
                                                 </td>
                                             </tr>
                                         </table>
                                     </td>
                                     <td style="padding: 1em 0; padding-right: 7%;width: 50%;vertical-align: bottom;">
                                         <table width="100%" style="border-spacing: 0;">
                                             <tr>
                                                 <td style="text-align: center;vertical-align: top;"><img class="content-img" src="https://ik.imagekit.io/healthhighway2020/usp2_TC32FC5sU1.png?updatedAt=1635336720279" alt="" width="81"></td>
                                             </tr>
                                             <tr>
                                                 <td>
                                                     <p class="usp-text" style="font-size: 10px;
                                                 color: #252525;
                                                 font-weight: 500;
                                                 width: 100%;
                                                 text-align: center;padding-top: .5em;">Flexible timing</p>
                                                 </td>
                                             </tr>
                                         </table>
                                     </td>
                                 </tr>
                                 <tr>
                                     <td style="padding: 1em 0; padding-left: 7%;width: 50%;    vertical-align: bottom;">
                                         <table width="100%" style="border-spacing: 0;">
                                             <tr>
                                                 <td style="text-align: center;"><img class="content-img" src="https://ik.imagekit.io/healthhighway2020/usp3_I5s8qT4yCBR.png?updatedAt=1635336777841" alt="" width="81"></td>
                                             </tr>
                                             <tr>
                                                 <td>
                                                     <p class="usp-text" style="font-size: 10px;
                                                 color: #252525;
                                                 font-weight: 500;
                                                 width: 100%;
                                                 text-align: center;padding-top: .5em;">Personal Diet Coach</p>
                                                 </td>
                                             </tr>
                                         </table>
                                     </td>
                                     <td style="padding: 1em 0; padding-right: 7%;width: 50%;    vertical-align: bottom;">
                                         <table width="100%" style="border-spacing: 0;">
                                             <tr>
                                                 <td style="text-align: center;vertical-align: top;"><img class="content-img" src="https://ik.imagekit.io/healthhighway2020/usp4_QxRpox7nb.png?updatedAt=1635336834889" alt="" width="81"></td>
                                             </tr>
                                             <tr>
                                                 <td>
                                                     <p class="usp-text" style="font-size: 10px;
                                                 color: #252525;
                                                 font-weight: 500;
                                                 width: 100%;
                                                 text-align: center;padding-top: .5em;">Choice of Instructor</p>
                                                 </td>
                                             </tr>
                                         </table>
                                     </td>
                                 </tr>
                             </table>
                         </td>
                     </tr>
     
     
                     <tr class="mobile-only">
                         <td>
                             <div class="h-rule"></div>
                         </td>
                     </tr>
     
     
     
                     <tr class="mobile-only">
                         <td>
                             <table width="100%" style="border-spacing: 0;">
                                 <tr>
                                     <td style="padding: 1em 6%; ">
                                         <h3 style="color: #252525; text-align: center;   font-size: 16px;
                                             font-weight: 600; padding-bottom: 1.25em;">Download <span style="color: #4CA9EE;">Health</span> <span style="color: #29E7CD;">Highway</span> app </h3>
                                     </td>
                                 </tr>
                                 <tr>
                                     <td>
                                         <img src="https://ik.imagekit.io/healthhighway2020/Frame_25_XP_LWot4JXc.png?updatedAt=1634991739105" alt="dwnload-app" style=" display: block;margin: 0 auto;margin-bottom: 1.5em;">
     
     
                                     </td>
     
                                 </tr>
                                 <tr>
                                     <td style="vertical-align: middle;text-align: center;">
     
                                         <p style="font-size: 10px;
                                             color: #757575;
                                             font-weight: 500;
                                             width: 50%;
                                             text-align: center;display: inline-block;font-family: 'Montserrat';">For enhanced experience on your mobile phone</p>
                                     </td>
                                 </tr>
                                 <tr>
                                     <td style="vertical-align: middle;text-align: center;"> <a href="https://play.google.com/store/apps/details?id=com.healthhighwaylive" class="template-btn" style="margin-bottom: 2em;margin-top: 2em;">Download Now</a></td>
                                 </tr>
                             </table>
                         </td>
                     </tr>
     
     
                     <!-- footer -->
                     <tr class="footer">
                         <td style="background-color: #252525;padding: 1em 5%;">
                             <table width="100%" style="border-spacing: 0;">
                                 <tr>
                                     <td style="text-align: left;"><a href="https://www.healthhighway.co.in/" style="color: white;text-decoration: none; text-align: left; display: inline-block; margin: 0 auto;font-size: 10px;">www.healthhighway.co.in</a>
                                     </td>
                                     <td class="mobile-social" style="text-align: right;">
                                         <a href="https://www.instagram.com/healthhighwayin/"><img width="20" style="margin: 0 .25em;" src="https://ik.imagekit.io/healthhighway2020/instagram_X_Mj1lPuT.png?updatedAt=1635160690169" alt=""></a>
                                         <a href="https://www.linkedin.com/company/healthhighway/"><img width="20" style="margin: 0 .25em" src="https://ik.imagekit.io/healthhighway2020/linkedin_WypWRYxt0QL.png?updatedAt=1635160691039" alt=""></a>
                                         <a href="https://www.facebook.com/healthhighwayin/"><img width="20" style="margin: 0 .25em" src="https://ik.imagekit.io/healthhighway2020/facebook_1wJQ3vRFl3f.png?updatedAt=1635160688965" alt=""></a>
                                     </td>
                                 </tr>
                                 <!-- <tr>
                                         <td style="text-align: right;" colspan="2"><a href="https://www.healthhighway.co.in/" style="color: white;text-decoration: none; text-align: center; display: inline-block; margin: 0 auto;font-size: 10px;">www.healthhighway.co.in</a>
                                         </td>
                                     </tr> -->
                             </table>
                         </td>
                     </tr>
                     </tr>
                 </table>
     
             </div>
         </center>
     
     </body>
     
     </html>`;

    return html;
}
