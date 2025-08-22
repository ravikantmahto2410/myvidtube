import { Router } from "express";
import { toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route('/togglevideolike/:videoId').patch(verifyJWT, toggleVideoLike)
router.route('/toggletweetlike/:tweetId').patch(verifyJWT, toggleTweetLike)
export default router