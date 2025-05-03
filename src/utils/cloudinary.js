import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()


// Configure Cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

//lets design simple method
const uploadOnCloudinary = async(localFilePath) => { //whoever is calling this function need to provide me a local file path , because whenver you uplaod through the multer the return that you get from the multer function is  the filepath wherever that is in your local storage . Local storage means  your server storage
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type:"auto"
            }
        )
        console.log("File uploaded on cloudinary, File src: " + response.url)

        //once the file is uploaded we would like to delete  it from from our servers
        fs.unlinkSync(localFilePath)
        return response 
    } catch (error) {
        console.log("Error on Cloudinary", error)
        fs.unlinkSync(localFilePath)//if there is somthing wrong in uploading to cloudinary ,we want to remove this file from the our local storage as well to do that we use fs method , it is a fs method od nodeJs
        return null
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("Deleted form cloudinary.Public id ", publicId)
    } catch (error) {
        console.log("Error deleting from cloudinary")
        return null
    }
}
export { uploadOnCloudinary, deleteFromCloudinary  }