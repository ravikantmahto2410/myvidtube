import { Router } from "express";
import { toggleSubscription,getUserChannelSubscribers } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route('/togglesubscription/:channelId').patch(verifyJWT, toggleSubscription)
router.route('/channelsubscribers/:channelId').get(verifyJWT,getUserChannelSubscribers)

export default router