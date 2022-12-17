const multer = require('multer')

//multer middleware configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // public/products-uploads   is the folder for storing images
    cb(null, 'public/products-uploads')  // returns folder name 

  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)  // returns the filename of images  stored in folder
  }
})

module.exports =  upload = multer({ storage: storage })