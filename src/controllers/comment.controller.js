import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { Comment } from "../models/comment.models.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "videoId is invalid")
    }

    const comment =  Comment.aggregate([
        {
            $match : {
               video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort:{
                createdAt: -1
            }
        }
    ])

    const paginate = await Comment.aggregatePaginate(comment,{

        page:parseInt(page),
        limit: parseInt(limit)
    })

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            paginate,
            "video Comment Fetched Successfully"
        ))
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
    const {commentId} = req.params
    const {content} = req.body

    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "CommentId not found")
    }

    if(!content?.trim()){
        throw new ApiError(401, "Content is required")
    }

    
    const existingComment = await Comment.findById(commentId)
    if(!existingComment){
        throw new ApiError(404, "comment not found")
    }

    if(existingComment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set :{
                content: content
            }
        },
        {new:true}
    )

    return res
        .status(200)
        .json(new ApiResponse (200, updatedComment, "comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "commentId is invalid")
    }

    const existingComment = await Comment.findById(commentId)
    if(!existingComment){
        throw new ApiError(404, "comment not found")
    }

    if(existingComment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this comment")
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
        throw new ApiError(400, "failed to delete comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}