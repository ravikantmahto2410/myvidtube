import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { Comment } from "../models/comment.models.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(401, "VideoId not found")
    }

    if(!content?.trim()){
        throw new ApiError(400, "content is required")
    }

    const newComment = await Comment.create({
        content,
        owner : req.user?._id,
        video: videoId
    })

    if(!newComment){
        throw new ApiError(401 , "Failed to add comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            newComment,
            "new comment added successfully"
        ))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}