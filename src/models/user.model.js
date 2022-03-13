import express from "express"
import { jRes } from "../utils/response.util.js"
import {UserModel} from '../models/schema/user.schema.js';
import { sendSignUpMail } from "../utils/email.util.js"
import { body, param } from "express-validator"


export const userModelS = async () => {
  const isUser = await UserModel.findOneAndUpdate(
    { gmailAddress: req.body.gmailAddress },
    {
      lastEntryLocation: req.body.lastEntryLocation,
      lastEntryPoint: req.body.lastEntryPoint,
    },
    { new: true }
  );

  if (isUser) {
    jRes(res, 200, isUser);
    return;
  }

  const newUser = new UserModel({
    name: req.body.name,
    gmailAddress: req.body.gmailAddress,
    profilePhotoUrl: req.body.profilePhotoUrl,
    lastEntryLocation: req.body.lastEntryLocation,
    lastEntryPoint: req.body.lastEntryPoint,
    createdAt: new Date().toISOString(),
  });

  return newUser.save();
};
