import {UserModel} from './schema/user.schema'

export const userdatabase=()=>{
    UserModel.findOneAndUpdate(
                                { gmailAddress : req.body.gmailAddress },
                                { lastEntryLocation : req.body.lastEntryLocation, lastEntryPoint : req.body.lastEntryPoint},
                                { new : true }
                            )
}