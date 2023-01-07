var express = require('express');
const adminHelpers = require('../helpers/adminHelpers');
var router = express.Router();
const upload = require('../middleware/multer')
const fs = require('fs')
const { isAdminAuth, isAdmin } = require('../middleware/authMiddleware')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
require('../config/passport')(passport)

//isAdminAuth is a middleware that only allow next when user is authenticated


/* GET home page. */
router.get('/',isAdminAuth,isAdmin, async function (req, res) {
    
        
             //Fetch number of products orders users and delevery from database
         let { users , products ,orders ,delevery} = await adminHelpers.getNumber()
         //Fetch top selling products from database
         let topProducts = await adminHelpers.getTopSellingProduct()
         //Fetch orders from database
         let ordersDetails = await adminHelpers.getLimitOrders()
         res.render('admin/dashboard', { title: 'Admin-Dashboard', users, products, orders: orders[0], delevery: delevery[0], ordersDetails, topProducts })  //render dashboard.hbs file in admin folder 
         
     
   });

// Get products page
router.get('/products',isAdminAuth, async function (req, res) {
  
  let products = await adminHelpers.getAllProducts()    //fetch all products from database
  res.render('admin/products',{title:"Admin-Products" ,products})  //render products.hbs file from admin folder
});

//Get Add products page
router.get('/addProduct',isAdminAuth, function (req, res) {
    res.render('admin/addProduct',{title:"Admin-addproduct" })      //render addProducts.hbs file from admin folder
});

router.post('/addProduct',upload.array('images',8), (req, res) => {
  req.body.date = new Date()  // adding date field to reb.body object
  req.body.delevery = parseInt(req.body.delevery) //convert delevery field to intiger datatype
  req.body.price = parseInt(req.body.price)  //convert price field to intiger datatype
  
  let images = []                 //images is an empty array initially and push each images from req.files to the array
  req.files.forEach((item) => {
    images.push(item.filename)
  })
  req.body.images = images    // add images as a field in req.body obj
  if (!req.files) {
    res.send('please select an image')   //if no images selected
  } else {
    //add req.body object to database
    adminHelpers.addProduct(req.body).then((response) => {
      res.redirect('/admin/addProduct')
    })
  }
})
//route for deleting product from database
router.get('/deleteproduct/:id',isAdminAuth, async function (req, res) {
  
  let product = await adminHelpers.getProduct(req.params.id)     //Fetch product from database using its id passed through req.params

  //qurey for deleting product from database using its id passed through req.params
  adminHelpers.deleteProduct(req.params.id).then(async (response) => {

      //deleteFiles is a function that delete files from that specific path using fs module
       function deleteFiles(files, callback){
         var i = files.length;
         files.forEach(function (filepath) {
           //fs.unlink is a method used to remove file fromn  specific path 
           fs.unlink('/Users/vaish/web development/Mens/public/products-uploads/'+filepath, function(err) {
             i--;
             if (err) {
               callback(err);  //if error occures then return err
               return;
             } else if (i <= 0) {
               callback(null);  //return null
             }
           });
         });
       }
       
       var files = product.images
    
    
    // files and a callback function is passing as parameters of function deleteFiles
    deleteFiles(files, function (err) {
         if (err) {
           console.log(err);
         } else {
           console.log('all files removed');
         }
    });
      
      res.json({deleted:true})  // returns json 
   })
});

// route for edit products
router.get('/editproduct/:id', isAdminAuth, async function (req, res) {
  
 //Fetch all products using id passed thorugh params obj
  let product = await adminHelpers.getProduct(req.params.id)
  res.render('admin/editproduct',{title:"Admin-editproduct" ,product})  //render editproduct.hb file
});

router.post('/editproduct/:id',upload.array('images',8) ,async function (req, res) {
  req.body.date = new Date()    //add a dete field to req.body obj
  req.body.delevery = parseInt(req.body.delevery) //convert delevery field into integer datatype
  req.body.price = parseInt(req.body.price)   //convert price field into integer datatype
  
 // no file selected
  if (req.files.length === 0) {
    //edit products without editing images in database
    adminHelpers.editProductWithoutImage(req.params.id, req.body).then((response) => {
       res.redirect('/admin/products')
    })
  } else {
  
  let product = await adminHelpers.getProduct(req.params.id)
     //delete images
     //deleteFiles is a function that delete files from that specific path using fs module
       function deleteFiles(files, callback){
         var i = files.length;
         files.forEach(function (filepath) {
           //fs.unlink is a method used to remove file fromn  specific path 
           fs.unlink('/Users/vaish/web development/Mens/public/products-uploads/'+filepath, function(err) {
             i--;
             if (err) {
               callback(err);  //if error occures then return err
               return;
             } else if (i <= 0) {
               callback(null);  //return null
             }
           });
         });
       }
    
    
    // files and a callback function is passing as parameters of function deleteFiles
    deleteFiles(files, function (err) {
         if (err) {
           console.log(err);
         } else {
           console.log('all files removed');
         }
      });
    
        let images = []                 //images is an empty array initially and push each files selected to images from req.files 
        req.files.forEach((item) => {
          images.push(item.filename)
        })
  
  
    req.body.images = images  //images field added to req.bodyobj
    //edit product from database using produt id passed through parems obj
    adminHelpers.editProduct(req.params.id,req.body).then((response) => {
      res.redirect('/admin/products')
    })
  }
});
// Get users page
router.get('/users', isAdminAuth, (req, res) => {
  //Fetch all users from databases
  adminHelpers.getAllUsers().then((users) => {
     res.render('admin/users',{title:"Admin-Users" ,users})
   })
})


//  Get orders page
router.get('/orders' ,isAdminAuth, (req, res) => {
  
  // Fetch all orders from database
  adminHelpers.getOrders().then((orders) => {
     res.render('admin/orders',{title:"Admin-Orders" ,orders})   //render orders.hbs file in the admin folder
   })
})

// Get order details page
router.get('/order-details/:orderId/:productId/:size', (req, res) => {
  
  const { orderId, productId, size } = req.params
  //fetch orderdetails from database using orderId , productId ,size that passed through req.params object
  adminHelpers.getOrderDetails(orderId , productId,size).then((orderDetails) => {
     console.log(orderDetails);
      res.render('admin/order-details',{title:"Admin-orderdetails" ,orderDetails})  //render order-details.hbs file in the admin folder
   })
})

router.post('/order-details/:id/:productId/:size', (req, res) => {
  if (req.body.delevered) {
    //place delevery of the porduct in  database
    adminHelpers.placeDelevery(req.params.id, req.params.productId, req.params.size).then((response) => {
      res.redirect(`/admin/order-details/${req.params.id}/${req.params.productId}/${req.params.size}`)
    })
  }
})

router.get('/ban-user/:userId', (req, res) => {
  let userId = req.params.userId
  
  adminHelpers.banUser(userId).then((response) => {
    res.json({banned:true})
  })
})

router.get('/unban-user/:userId', (req, res) => {
  let userId = req.params.userId
  
  adminHelpers.unbanUser(userId).then((response) => {
    res.json({unbanned:true})
  })
})


module.exports = router;
