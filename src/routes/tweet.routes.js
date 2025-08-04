import { Router } from "express";
import { createTweet } from "../controllers/tweets.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route('/create-tweet').post(verifyJWT, createTweet);

export default router

