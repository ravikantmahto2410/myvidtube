import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"


export const verifyJWT = asyncHandler(async(req, __, next) => {

    const token = req.cookies.accessToken || req.header
    ("Authorization")?.replace("Bearer", "")

    if(!token) {
        throw new ApiError(401, "Unauthorized")
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        //once we get the decoded token , next step is to grab the user  request a query from the database and get it back

       const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

       //now check whether the user actually came in or not
       if (!user) {
            throw new ApiError(401, " Unauthorized ")

       }

       req.user = user
       //now we need to transfer the controll from the middleware to the controller
       next() //the control is transferred from the middleware to the controller
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token ")
    }

})