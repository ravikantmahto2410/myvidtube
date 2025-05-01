import multer from "multer";

//Step  1: is to allow the diskStorage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) { //here we are mentioning the what will be the filename , when i store the file inside my  folder structure
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname)
    }
  })

  export const upload = multer({
    storage
  }) 