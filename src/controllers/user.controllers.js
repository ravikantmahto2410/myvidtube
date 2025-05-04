import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {//if we dont have userId we cant do query to the database
    try {
        //first step is to simply fire up a query, so that i can find the user
        const user = await User.findById(userId);
    
        //Small HW: small check for user existence
    
        //now lets generate accessToken
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
    
        return{accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
}
const registerUser =  asyncHandler(async (req, res) => {
    const {fullname, email, username, password} = req.body //we need to destructure whatever is coming from the frontend side            //we are also accepting the images , but those are not coming in the request body they are coming in the req.files , that is what injected by the multer

    //validation
    // if(fullName?.trim() === ""){
    //     throw new ApiError(400, "All fields are required")
    // } since we are not checking for all the fields  we can also use a classic javascript to handle this

    if(
        [fullname, username, email, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    //now i would like to see whether i have a existing user in my database , inorder to find that we need to bring in the user model
    // User. //since User is a model object it has so many options that it provides me now , queries like where, aggregate, aggregatePaginate, apply , I can can make queries as well
    // User.findOne({email}) //in case i want to find the user based on only on email
    // User.findOne({username}) //I can also find the user based on only on username

    const existedUser = await User.findOne({ //we can also mongoDB operators  to find the user
        $or: [{username},{email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    //now lets handle the images
    console.warn(req.files) //to check whether the multer was working properly or not
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //now it's time to upload this on cloudinary , because we want to save that in our database . our database is saving the url of that inorder to do that we need to first bring the ulpoadOnCloudinary
    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // let coverImage = ""
    // if(coverLocalPath){
    //     coverImage = await uploadOnCloudinary(coverImage)
    // }

    //optimised
    //now it's time to upload this on cloudinary , because we want to save that in our database . our database is saving the url of that inorder to do that we need to first bring the ulpoadOnCloudinary
    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Uploaded avatar",avatar)
    } catch (error) {
        console.log("Error uploading avatar",error)
        throw new ApiError(500, "Failed to upload avatar")
    }

    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath)
        console.log("Uploaded coverImage",coverImage)
    } catch (error) {
        console.log("Error uploading coverImage",error)
        throw new ApiError(500, "Failed to upload coverImage")
    }

    //now let's construct the user
    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
    
        //assuming we have interacted with the user and we have created a user in the database now we want to verify whether this user was created on the database or not 
        const createdUser = await User.findById(user._id).select("-password -refreshToken") 
        
        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registering the user")
        }
        return res 
            .status(201)
            .json(new ApiResponse(200), createdUser,"User registered successfully")
        } catch (error) {
        console.log("User creation failed")

        if (avatar){
            await deleteFromCloudinary(avatar.publicId)

        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.publicId)
        }

        throw new ApiError(500, "Something went wrong while registering the user and images were deleted")
    }

})

const loginUser = asyncHandler( async( req, res) => {
    //getData from the body
    const {email, username, password} = req.body

    //validation
    if(!email){ //we can also check with other fields
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({ //we can also use  mongoDB operators  to find the user
        $or: [{username},{email}]
    })

    if(!user) {
        throw new ApiError(404, "User not found")
    }

    //validate password
    const isPasswordValid = await user.isPasswordCorrect(password) 

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid Credentials")
    }

    //if the password is correct, now is the time to generate or take help from our helper method to generate the acessToken and refreshToken
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    
    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken ")
    //now the result that comes to us after this loggedInUser query is going to be a userObject which doesn't have the the password field and refreshToken


    //exercise : checkIn whether we have loggedinUser or not
    //HW  solving
    // if(!loggedInUser){
    //     throw new ApiError(403,"Not a loggedInUser");
    // }

    const options = {
        httpOnly: true, //this makes the cookie non-modifiable by the client side
        secure : process.env.NODE_ENV === "production",

    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        // .json(new ApiResponse(200,loggedInUser, "User logged in successfully"))

        //we can also send the response like this
        .json(new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken},
            "User logged in successfully"
        ))

})

const logoutUser = asyncHandler(async (req, res) => { //this is simple method which we don't need to return anything ,most important thing is we have something in the database that needs to be changed 
    //true logout means we have to remove the refreshToken part  
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {new: true}

    ) //why update because  i don't want to remove the entire record , just update one field in the database

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }

    return res
        .status(200)
        .clearCookie("accessToken", options) //remember when we dont pass the options , it doesn't set it to anything , jsut refresh everything
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => { //this is designed so that you can have new fresh set of accessToken being generated
    //step 1 : is first of all go ahead and collect that incoming refresh token 

    const incomingRefreshToken = req.cookies.refreshAccessToken || req.body.refreshToken
    
    if(!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required")
        
    }

    //if you are accessing or refreshing any token try to wrap it up in try catch block
    try { 
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        ) //to decode the token
        const user = await User.findById(decodedToken?._id)

        if(!user) {
            throw new ApiError(401, " Invalid Refresh Token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, " Invalid refresh token ")
        }

        //generating the new token and send it to the user
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }

        //lets generate the new token
        const {accessToken, refreshToken: newRefreshToken} =  await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    }, 
                    "Access token refreshed successfully"
                )
            );

    } catch (error) {
        throw new ApiError(500, " Something went wrong while refreshing the access token ")
    }

})

export {
    registerUser,
    loginUser,
    generateAccessAndRefreshToken,
    logoutUser
}