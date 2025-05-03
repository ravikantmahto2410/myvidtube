import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


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

export {
    registerUser
}