import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async(req , res) => {
    const {channelId} = req.params
    //TODO : toggle subscription
    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(401, "ChannelId not found")
    }

    const existingSubscription = await Subscription.findOne(
        {
            subscriber : req.user._id,
            channel : channelId
        }
    );

    if(existingSubscription){
        await Subscription.findOneAndDelete({
            subscriber : req.user._id,
            channel : channelId
        })
        return res
            .status(200)
            .json(
                new ApiResponse(
                    true,
                    200,
                    "subscription toggled successfully"
            )
        );
    }
    
    const newSubscription = new Subscription({
        subscriber : req.user._id ,
        channel: channelId
    })
    await newSubscription.save();
    


    return res
        .status(200)
        .json(new ApiResponse(200,newSubscription ,"subscription toggled successfully"))

})

//controller to bring the subscriber
const getUserChannelSubscribers = asyncHandler(async(req ,res) => {
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400, "channel is missing")
    }

    const channelSubscribers = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId.trim())
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscribers"
            }
        },
        
        {
            $addFields :{
                subscribersCount : {
                    $size: "$subscribers"
                },
            }
        },
        {
            $unwind: "$subscribers"  // Unwind to flatten the array of subscribers
        },

        {
            $project:{
            
                    "subscribers.fullName":1,
                    "subscribers.username":1,
                    "subscribers.email":1,
                    "subscribers.isSubscribed":1,
                    "subscribers.avatar":1,
                    "subscribers.coverImage":1    
            }
        }
    ])
    

    if(!channelSubscribers?.length){
        throw new ApiError(404, "No subscribers found")
    }

    return res
        .status(200)
        .json( new ApiResponse(200,channelSubscribers, "channel Subscribers fetched Successfully" ))
})

const getSubscribedChannels = asyncHandler(async(req, res) => {
    const {channelId} = req.params

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(402, "subscribedId is required")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField : "_id",
                as: "subscribedChannels",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            }
        },
        {
            $addFields:{
                subscribedChannels :{
                    $arrayElemAt: ["$subscribedChannels",0]
                }
            }
        },
        
    
    ]) 

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "Fetched subscribed to channel list"))
})

export {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers

}