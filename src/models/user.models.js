/*
    id string pk 
    username string
    email string 
    fullName string
    avatar string
    coverImage string
    watchHistory ObjectId[] videos 
    password string 
    refreshToken string 
    createdAt Date 
    updatedAt Date  
*/

import mongoose , { Schema } from "mongoose"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //Cloudinary URL
            required: true
        },
        coverImage: {
            type: String, //cloudinary URL
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video" //ref because we have to mention that from where you are bringing the ObjectId , ObjectID is in like, user, tweet, in video , which one you are referring to
                            //again at the time of referring you mentionwhat schema you are mentioning  for example below is User, User i am referring , it needs to be go into the string
            }
        ],
        password:{
            type: String,
            // required: true  we can mention required like this  , butu instead of saying required : true , we can also do in another way like in next line
            required: [true, "password is requires"] // the first element needs to be boolean and the another one is what message you want to pass on to the frontend if this field was not there
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true  // the moment we mention the timestamp as true, your document will automatically gets two fields , which are createdAt , and updatedAt , which will be type of Date
    }
)

export const User = mongoose.model("User", userSchema) //The whole idea is in the mongoDB, the mongoose is going to go ahead and create a document with this structure, if this document does't exist it's going to go ahead and create that. and while creating the document it will create the mongoose feature , Mongoose is saying that hey mongoose , i want to build a model, new structure and a new document in my database . that document will be called as user and the schema structure that my database is going to follow , i will refer to this user schema ,which is mentioned at line 17. we are also exporting because whenever i will need , i can actuallt import this model , and not just this model  but all the features of mongoDb , like quering database , finding an element or saving any new data in the database, al these features are exported because now User  is not an ordinary variable , but avaribale that is designed by mongoose and especially the model of the mongoose 