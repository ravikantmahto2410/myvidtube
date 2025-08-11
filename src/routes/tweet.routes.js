import { Router } from "express";
import { createTweet,getUserTweets ,updateTweet} from "../controllers/tweets.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route('/create-tweet').post(verifyJWT, createTweet);
router.route('/getusertweets/:userId').get(verifyJWT,getUserTweets);
router.route('/updateTweet/:tweetId').patch(verifyJWT,updateTweet)
export default router

