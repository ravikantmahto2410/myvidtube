
import mongoose , { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema( //this is a method
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
            // required: true, //  we can mention required like this  , but instead of saying required : true , we can also do in another way like in next line
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

//Note : Every single time we are storing the user we want to encrypt the password
//How we want to that , password should be in the database in the encrypted format ,so just before saving the details into the password we want to encrypt the paswword

userSchema.pre("save", async function(next){ //pre means before saving. //Save is the event that we are triggering .//Tip: never use arraow function here //all the function here all the times 100 times requires next  because next is the way to pass on your request from one middleware to next middleware to the next middleware
    
    // if(this.modified("password")){ }//this will notify whether the things are modified /..This line basically says that if the password field is modifying then only encrypt
    
    if(!this.isModified("password")) return next()//this will notify whether the things are modified /..This line basically says that if the password field is not modifyied then simply just return next 

    this.password = await bcrypt.hash(this.password, 10) //our password is encrypted

    next() //  this will either pass it on to the next pre hook ,next Middleware or wherever it needs to go

})

userSchema.methods.isPasswordCorrect = async function(password){ //isPasswordCorrect : this method will take the user's password  , it will take the password from the database as well  and will try to match it , whether they are  equal or not
    return await bcrypt.compare(password, this.password);
}  
    
//Whenever a user gets successfully loggedIn we want to generate some accessToken and some refreshToken
  //accessToken: We give the user for a short time , hey you take this token
  //RefreshToken : refreshToken are long term token, which we store in the database as well  ,and this  allows to disable the user whenever we want , hey want a fresh login

  //Generating the accessToken
  // userSchema.methods  because I want to add another method into this one
  userSchema.methods.generateAccessToken = function (){
    //this is short lived access token
    return jwt.sign({
        _id: this._id,
        email: this.email, 
        username: this.username,
        fullname: this.fullname  //note the accessToken may have the email, username, fullname or may not have. refreshToken have only one thing that is _id
    }, 
        // "shhhhh",  we can keep this as hard coded  but now we are going to process from the .env file
        process.env.ACCESS_TOKEN_SECRET,

        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    );
  }


  userSchema.methods.generateRefreshToken = function (){
    //this is long lived access token
    return jwt.sign({
        _id: this._id, //refreshToken have only one information so that we can update the fields
    }, 
        // "shhhhh",  we can keep this as hard coded  but now we are going to process from the .env file
        process.env.REFRESH_TOKEN_SECRET,

        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    );
    //we will make the database queries if the refreshToken is not even present then we don't allow the access token to get refreshed , and we can force logout based on this refreshToken, because they are stored in the database
  }

export const User = mongoose.model("User", userSchema) //The whole idea is in the mongoDB, the mongoose is going to go ahead and create a document with this structure, if this document does't exist it's going to go ahead and create that. and while creating the document it will create the mongoose feature , Mongoose is saying that hey mongoose , i want to build a model, new structure and a new document in my database . that document will be called as User and the schema structure that my database is going to follow , i will refer to this user schema ,which is mentioned at line 17. we are also exporting because whenever i will need , i can actually import this model , and not just this model  but all the features of mongoDb , like quering database , finding an element or saving any new data in the database, al these features are exported because now User  is not an ordinary variable , but avaribale that is designed by mongoose and especially the model of the mongoose 