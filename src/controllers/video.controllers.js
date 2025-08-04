import mongoose, {isValidObjectId, set} from "mongoose";
import {Video} from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10,query,sortBy, sortType, userId} = req.query
    //TODO : get all videos based on query , sort , pagination

    if(!userId || !mongoose.Types.ObjectId.isValid(userId.toString())){
        throw  new ApiError(400, "invalid use id")
    }

    const aggregate = await Video.aggregate([
        {
            $sort : {
                [sortBy] : sortType === 'asc'? 1 : -1, 
            }
        }
    ]);

    const fetchedVideos = await Video.aggregatePaginate(aggregate,{
        limit: Number(limit),
        
        page: Number(page),
    })
    
    return res
    .status(200)
    .json( new ApiResponse(
        200,
        fetchedVideos,
        videosFetchedSuccessfully
    ))


}) 


const publishAVideo = asyncHandler( async (req,res) => {
    const {title, description} = req.body

    const user = await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(400, "User not found")
    }
    
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
    const video_duration = videofile.duration;
    console.log(video_duration);
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
            owner : user._id,
            duration : video_duration,
            
        })
        console.log(video)
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

        if(videofile){
            await deleteFromCloudinary(videofile.public_id)
        }
        if(thumbnail){
            await deleteFromCloudinary(thumbnail.public_id)
        }

        throw new ApiError(500, "Something went wrong while publishing a video")
    }

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    //TODO : get video by ID

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "videoId not found")
    }
   
    const videobyid = await Video.aggregate(
        [
            {
                $match:{
                    _id : new mongoose.Types.ObjectId.isValid(videoId)
                }
            },
            {
                $lookup:{
                    from: "users",
                    localField : "owner",
                    foreignField : "_id",
                    as : "userDetails"
                },
                

            },
            {
                $unwind:"$userDetails",
            },
            {
                $project : {
                    username:"$userDetails.username",
                    thumbnail:1,
                    description: 1,
                    title: 1,
                    views: 1,
                    duration: 1,
                    videoFile: 1,

                }
            }
        ]
    )
    if(!videobyid){
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, videobyid, "videos fetched successfully")
        )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title, description} = req.body
    //TODO: update video details like title, description, thumbnail
    
    if(!title.trim() || !description.trim()){
        throw new ApiError(400, "All fields are required")
    }

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "videoId not found")
    }

    const thumbnailLocalpath = req.file?.path
    
    if(!thumbnailLocalpath){
        throw new ApiError(400, "Thumbnail is not selected")
    }

    const newThumbnail = await uploadOnCloudinary(thumbnailLocalpath);
    console.log("uploaded thumbnail", newThumbnail)
    if(!newThumbnail.url){
        throw new ApiError(500, "something went wrong while uploading the thumbnail")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                thumbnail:  newThumbnail.url,
                title : title,
                description : description
            }
        },
        {new: true}
    )
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video details updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "VideoId not found")
    }

    const video = await Video.findByIdAndDelete(videoId);

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(404, "Video Id not found")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, 'Video is not found')
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res 
        .status(200)
        .json(new ApiResponse(200, video, "Video Toggled Successfully"))
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

