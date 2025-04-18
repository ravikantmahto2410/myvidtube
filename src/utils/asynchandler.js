const asyncHandler = (requestHandler) => { //feel free  to name anything instead of requestHandler. // 

    return(req, res, next) => { //this next is middleware
        Promise.resolve(requestHandler (req, res, next)).catch((err) => next(err))
    } 
}
export { asyncHandler }

//this is a classic HigherOrderFunction in which you are  accepting a parameter as a function as well as you are returning a parameter is a function