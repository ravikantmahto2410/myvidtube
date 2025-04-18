import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

//create healthcheck
    //usual common practise
    // const healthcheck = async (req, res) => {
    //     //there is no guarantee that req, res will happen as expected, so every single time we have to write a try catch block
        
    //     try {
    //         res.status(200).json
    //     } catch (error) {
            
    //     }
        
    // }

    //but since i don't want to use this do try catch every single time ,I have an an asyncHandler built up
    const healthcheck = asyncHandler( async(req , res) => {
        return res
        .status(200)
        // .json( {message: "test ok"}) //but this is not an standard response , the standerd will be that we have done inApiresponse
        .json(new ApiResponse(200, "OK", "Health check passed"))

    })
    export {healthcheck}
