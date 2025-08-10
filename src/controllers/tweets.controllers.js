import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.models.js";
import mongoose, {isValidObjectId} from "mongoose";
import { User } from "../models/user.models.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body

    if(content.trim() === ''){
        throw new ApiError(400, "content is required")
    }

    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(400, "User not found")
    }

    try {
        const tweet = await Tweet.create({
            content,
            owner : user._id
        })

        console.log(tweet)

        const senttweet = await Tweet.findById(tweet._id)
        if(!senttweet){
            throw new ApiError(400, "Something went wrong while writing tweets")
        }

        return res
            .status(201)
            .json( new ApiResponse(200), senttweet, "Tweet Uploaded Successfully")
    } catch (error) {
        console.log("Uploading tweet failed")
        throw new ApiError(500, "Something went wrong while publishingtweet")
    
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user.id
    console.log(userId);
    if(!userId){
        return ApiError(400, "Invalid user id")
    }

    const alltweets = await Tweet.aggregate([
        {
            $match : {
                owner : new  mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField: "owner",
                foreignField : "_id",
                as : "usertweets"
            
            }
        },

        {
            $unwind: "$usertweets",
        },
        {
            
            $project : {
                
                username: "$usertweets.username",
                createdAt:1,
                updatedAt:1,
                content:1

            }
            
        }

    ])
    console.log(alltweets)
    if(!alltweets){
        throw new ApiError(400, "Something went wrong while fetching the tweets")
    }

    
    return res
        .status(200)
        .json(new ApiResponse(200, "All tweets fetched successfully",alltweets))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}