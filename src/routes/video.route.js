import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, publishAVideo, updateVideo, togglePublishStatus} from "../controllers/video.controllers.js";

const router = Router()

router.route("/").get(verifyJWT,getAllVideos)
router.route("/publishAVideo").post(
    verifyJWT,
    upload.fields([
        {
            name : "videofile",
            maxCount : 1
        },
        {
            name : "thumbnail",
            maxCount : 1
        }
    ]),
    publishAVideo
)
router.route("/updatevid/:videoId").patch(verifyJWT,upload.single("thumbnail"),updateVideo)
router.route("/deletevid/:videoId").delete(verifyJWT,deleteVideo)
router.route("/togglePublish/:videoId").patch(verifyJWT,togglePublishStatus)
export default router