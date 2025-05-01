import { asyncHandler } from "../utils/asynchandler"
import {ApiError} from "../utils/ApiError.js"

const registerUser =  asyncHandler(async (req, res) => {
    const {fullName, email, username, password} = req.body //we need to destructure whatever is coming from the frontend side            //we are also accepting the images , but those are not coming in the request body they are coming in the req.files , that is what injected by the multer

    //validation
    // if(fullName?.trim() === ""){
    //     throw new ApiError(400, "All fields are required")
    // } since we are not checking for all the fields  we can also use a classic javascript to handle this

    if(
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    
    
})

export {
    registerUser
}