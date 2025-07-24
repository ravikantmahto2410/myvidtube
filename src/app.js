import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser" //this is where we have to handle the cookie part
const app = express()

//Once the app is being designed , only after that you can mention these Middlewares , Middlewares : Middlewares  are  in between configuration so that you can do certain things in between and cors is one of the middlewares

app.use( // all the middlewares are written like this
    cors({ //inside this cors you can provide a object as options that what should be allowed and what should not be allowed
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)

//we can use some of the express middlewares so that we can make our app tiny bit more secure
//common middlewares
app.use(express.json({limit: "16kb"})) //some of the middleware from the express itself , express has property of .json so that all the json data are allowed to come in , but we will limit the data , so that unlimited data are not allowed
app.use(express.urlencoded({extended: true, limit:"16kb"})) //this middleware is urlencoded. Do you wnat your data to be be coming in url encoded format
app.use(express.static("public"))
app.use(cookieParser())
//we will bringin routes
    //import routes
    import healthcheckRouter from "./routes/healthcheck.route.js"
    import userRouter from "./routes/user.routes.js"
    import videoRouter from "./routes/video.route.js"
    import { errorHandler } from "./middlewares/error.middlewares.js"
    

    //routes
    app.use("/api/v1/healthcheck",healthcheckRouter)  //
    app.use("/api/v1/users",userRouter)
    app.use("/api/v1/videos",videoRouter)




    app.use(errorHandler)
export { app }