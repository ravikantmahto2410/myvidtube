
////note each model will have it's own controller and each controller will have its routes

import { Router } from "express"
import { healthcheck } from "../controllers/healthcheck.controller.js"
import { upload } from "../middlewares/multer.middlewares.js"

const router = Router()

router.route("/").get( healthcheck) //where this router will serve the route , .route("/") this '/' is not serving in the home slash this is the slash when we pass the controll to this controller

export default router

