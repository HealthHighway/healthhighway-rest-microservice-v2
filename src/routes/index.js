import express from "express";

import author from './author.route.js'
import blog from "./blog.route.js"
import callback from "./callback.route.js"
import corporate from './corporate.route.js'
import curate from './curate.route.js'
import fcmToken from './fcmToken.route.js'
import groupSession from './groupSession.route.js'
import privateSession from './privateSession.route.js'
import retreat from './retreat.route.js'
import review from './review.route.js'
import social from './social.route.js'
import trainer from './trainer.route.js'
import ttc from './ttc.route.js'
import user from './user.route.js'
import webinar from './webinar.route.js'
import filter from './blogFilter.route.js'

const apiRoutes = express.Router()

apiRoutes.use("/author", author)
apiRoutes.use("/blog", blog)
apiRoutes.use("/callback", callback)
apiRoutes.use("/corporate", corporate)
apiRoutes.use("/curate", curate)
apiRoutes.use("/fcmToken", fcmToken)
apiRoutes.use("/filter", filter)
apiRoutes.use("/groupSession", groupSession)
apiRoutes.use("/privateSession", privateSession)
apiRoutes.use("/retreat", retreat)
apiRoutes.use("/review", review)
apiRoutes.use("/social", social)
apiRoutes.use("/trainer", trainer)
apiRoutes.use("/ttc", ttc)
apiRoutes.use("/user", user)
apiRoutes.use("/webinar", webinar)

export function registerAppRoutes(app) {
    app.use('/api', apiRoutes)
}
