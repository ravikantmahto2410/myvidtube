
////note each model will have it's own controller and each controller will have its routes

import { Router } from "express"
import { registerUser, logoutUser, loginUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, getUserChannelProfile, updateAccountDetails, updateUserCoverImage, updateUserAvatar, getWatchHistory } from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const router = Router()

router.route("/register").post(  //where this router will serve the route that is .route("/register") .     //this is a post request because we are receiving some data and in the post request we need a controller to be brought in and that will be registerUser // But there is one issue with this , that is we need to uplaod or get some upload from the user  
    upload.fields([
        {
            name: "avatar",  //this name is important because that's how you are accepting the file in the controller itself
            maxCount: 1
        },{
            name: "coverImage",
            maxCount: 1,
        }

    ]),
    registerUser 
) //where this router will serve the route that is .route("/register") .     //this is a post request because we are receiving some data and in the post request we need a controller to be brought in and that will be registerUser // But there is one issue with this , that is we need to uplaod or get some upload from the user  

router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)
// secured routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/change-password").post(verifyJWT, changeCurrentPassword) //change password
router.route("/current-user").get(verifyJWT, getCurrentUser)//current user
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)//route to update the account
router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar) //patch to update the avatar
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"), updateUserCoverImage) //patch to update the avatar
router.route("/history").get(verifyJWT, getWatchHistory)

export default router

