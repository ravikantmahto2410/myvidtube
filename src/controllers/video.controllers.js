import mongoose, {isValidObjectId} from "mongoose";
import {Video} from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, query, sortBy, sortType, userId} = req.query
    //TODO : get all videos based on query , sort , pagination

    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(400, "User not found")
    }
    const videos = await Video.aggregate(
        [
            {
                $match : {
                    isPublished : true
                }
            },
            {
                $lookup : {
                    from : "users",
                    localField : "owner",
                    foreignField : "_id",
                    as : "videoOwner",
                    pipeline:[
                        {
                            $project: {
                                fullname : 1,
                                username: 1,
                                avatar : 1,
                            }
                        } 
                    ]
                }
            },{
                $addFields : {
                    videoOwner : {
                        $arrayElemAt : ["$videoOwner", 0],
                    }
                }
            },
            {
                $sort : {
                    createdAt : -1
                }
            },{
                $facet :{
                    data:[
                        {
                            $skip:(parseInt(page) - 1) * parseInt(limit)
                        },
                        {
                            $limit: limit
                        }
                    ]
                }
            }
        ]
    )

    return res
    .status(200)
    .json( new ApiResponse(
        200,
        videos[0],
        "videos fetched Successfully"
    ))


}) 


const publishAVideo = asyncHandler( async (req,res) => {
    const {title, description} = req.body

    if(title?.trim === ""){
        throw new ApiError(400, "title is required")
    }

    const videoLocalPath = req.files?.videofile?.[0].path
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path

    if(!videoLocalPath) {
        throw new ApiError(400, "Video File is Missing")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400, "thumbnail is required while uploading a video")
    }

    let videofile;
    try {
        videofile = await uploadOnCloudinary(videoLocalPath)
        console.log("uploaded video", videofile)
    } catch (error) {
        console.log("Error uploading video", error)
        throw new ApiError(500, "Failed to upload video ")
    }

    let thumbnail;
    try {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        console.log("thumbnail uploaded successfully",thumbnail)
    } catch (error) {
        console.log("Error uploading thumbnail",error)
        throw new ApiError(500, "Failed to uplaod thumbnail")
    }

    //now lets construct the video
    try {
        const video = await Video.create({
            title,
            description,
            videofile : videofile.url,
            thumbnail : thumbnail.url,
            isPublished : true,
            owner : req.user._id

        })

        //assuming we have interacted with the database and we have successfully sent the video and the thumbnail to the database
        //now we want to verify whether the video is sent to the database or not

        const sentVideo = await Video.findById(video._id)

        if(!sentVideo){
            throw new ApiError(400, "something went wrong while uploading the video")
        }

        return res
            .status(201)
            .json( new ApiResponse(200), sentVideo, "Video Uploaded Successfully")

    } catch (error) {
        console.log("Uploading video failed")
    }

})

export {
    getAllVideos
}

