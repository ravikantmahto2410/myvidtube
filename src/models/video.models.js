import mongoose , { Schema } from "momgoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {
        videofile: {
            type: String,  // it's a cloudinary url
            required: true
        },
        thumbnail: {
            type: String,  //It's a cloudinary url
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    }, {timestamps: true}
)

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema)