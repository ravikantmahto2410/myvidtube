import mongoose, {isValidObjectId} from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Like } from "../models/like.models.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { Tweet } from "../models/tweet.models.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(401, "video Id required")
    }

    const isLiked = await Like.findOne({
        likedBy: req.user?._id,
        video : videoId

    })
    if(isLiked){
        const deletedLike = await Like.findByIdAndDelete(isLiked._id)
        return res
            .status(200)
            .json(new ApiResponse(200, deletedLike, "video unliked"))
    }

    const newLike = await Like.create({
        likedBy: req.user?._id,
        video : videoId
    })

    return res
        .status(200)
        .json(new ApiResponse(200, newLike, "video liked successfully"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(402,  "commentId not found");
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(401, "invalid tweetId")
    }

    const isTweetLiked = await Like.findOne({
        likedBy : req.user?._id,
        tweet : tweetId
    })

    if(isTweetLiked){
        const deleteTweet = await Like.findByIdAndDelete(isTweetLiked._id)
        return res 
            .status(200)
            .json(new ApiResponse(200, deleteTweet, "tweetlike deleted successfully"))
    }

    const tweetLike = await Like.create({
        likedBy : req.user?._id,
        tweet : tweetId
    })

    return res
        .status(200)
        .json(new ApiResponse(200, tweetLike, "tweetLike created successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideoDetails = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user.id),
      },
    },
    {
      $lookup: {
        from: "videos",
        foreignField: "_id",
        localField: "video",
        as: "likeVideoData",
      },
    },
    {
      $unwind: "$likeVideoData",
    },
    {
      $project: {
        _id: 0,
        video: "$likeVideoData",
      },
    },
  ]);

  console.log("liked videos :", likedVideoDetails);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "fetched liked videos successfully",
        likedVideoDetails
      )
    );
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}