var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/userHelpers')
const passport = require('passport')
const {isAuth, isBanned } = require('../middleware/authMiddleware')
require('../config/passport')(passport)
const ObjectId = require('mongodb').ObjectId



/* GET users listing. */
router.get('/', (req, res) => {
  
      res.render('users/users', { title: `HUGO BOSS` })

});

router.get('/items/:id',isAuth,isBanned, (req, res) => {

  const title = req.params.id
    
  if (title === "mens" || title === "womens" || title === "kids"  || title === "accessories") {
    userHelpers.getProducts(req.params.id).then((data) => {
        res.render('users/products', { title:`HUGO BOSS-${title}` , products: data, pTitle : req.params.id})
      })
  } else {
    res.send('No page found')
   }
  
});

router.get('/product/:id',isAuth,  async (req, res) => {

  const id = req.params.id
  let review = await userHelpers.getProductReview(id)
  userHelpers.getProduct(id).then((product) => {
     res.render('users/product',{title:`HUGO BOSS-${product.title}`,product,review})
  })
 
});   

router.get('/product-image/:id',  (req, res) => {
  const id = req.params.id
  userHelpers.getProduct(id).then((product) => {
     res.render('users/product-images',{title:`HUGO BOSS-${product.title}`,product})
  })
 
});   

router.get('/add-to-cart/:id/:size',isAuth , (req, res) => {
  const id = req.params.id
  const size = req.params.size
  const userId = req.user._id
  console.log(size);
  if (req.user) {
    userHelpers.addToCart(id, userId, size).then((response) => {
      console.log(response);
      res.json({ status: true })
   
    })
  }
  
});

router.get('/cart',isAuth,isBanned, (req, res) => {
  const userId = req.user._id

  userHelpers.getCart(userId).then(async (cart) => {
    
    let getTotal = await userHelpers.getTotal(userId)
    console.log(cart);
    res.render('users/cart',{title:`HUGO BOSS-cart`,userId , cart ,getTotal:getTotal[0]})

  })
});

router.post('/cart/change-quantity',isAuth, (req, res) => {
    req.body.userId = req.user._id
    const userId = req.user._id
    console.log(req.body);

  userHelpers.changeQuantity(req.body).then(async(response) => {
    let getTotal = await userHelpers.getTotal(userId)
     
     response.getTotal = getTotal
     console.log(response);
     res.json(response)
  })
});

router.get('/cart/delete-product/:id/:size', (req, res) => {
  const userId = req.user._id
  const size = req.params.size
  const productId = req.params.id 
  

  userHelpers.deleteProductCart(userId, productId, size).then((response) => {
    if (response) {
      res.json({status:true,deleteId:productId,size:size})
    }
  })
 
});



router.get('/profile',isAuth,isBanned, (req, res) => {

   res.render('users/profile',{title:`HUGO BOSS-user`,user:req.user})
})

router.post('/profile/update-details', (req, res) => {
  
  userHelpers.updateUserDetails(req.body).then(response => {
    if (response) {
      res.json({updated:true})
    }
   })
})

router.get('/checkout',isAuth,isBanned, async (req, res) => {
  let userId = req.user._id 
  

  let detailsExist = await userHelpers.getDetails(userId)
  if (detailsExist) {
    res.redirect('/delevery')
  } else {

    let getTotal = await userHelpers.getTotal(userId)
    
    res.render('users/checkout', {title:`HUGO BOSS-checkout`, user: req.user, getTotal: getTotal[0]})
  }
});

router.post('/checkout', async (req, res) => {
  req.body.user = req.user._id

  if (req.body.firstname == '' || req.body.lastname == '' || req.body.address == '' || req.body.pincode == '' || req.body.city == '' || req.body.mobile == '') {
    res.render('users/checkout', { error: 'Please fill your address to continue purchase' })
  } else {
 
    userHelpers.addDetails(req.body).then((response) => {
      if (response) {
        res.redirect('/delevery')
      }
    })
  }
})

router.post('/checkout/edit-details',  async (req, res) => { 
   let userId = req.user._id 
  req.body.user = req.user._id
  
    userHelpers.editDetails(req.body).then((response) => {
      res.redirect('/delevery')
    })
  
})

router.get('/delevery',isAuth,  async (req, res) => {
    let userId = req.user._id 

   userHelpers.getDetails(req.user._id).then(async(details) => {
     if (details) {
       let getTotal = await userHelpers.getTotal(userId)
       console.log(getTotal);
       if (getTotal.length != 0) {
         res.render('users/delevery', {title:`HUGO BOSS-delevery`, details, user: req.user, getTotal: getTotal[0] })
       } else {
         res.redirect('/cart')
       }
    }
  })
});

router.get('/my-orders', isAuth , async(req, res) => {
  let userid = req.user._id
  
  let orderproducts = await userHelpers.getOrderProducts(userid)
  res.render('users/orders',{title:`HUGO BOSS-orders`,products:orderproducts})
})

router.get('/cancel-order/:id/:pId/:size', isAuth , async(req, res) => {
  let orderId = req.params.id
  let productId = req.params.pId
  let size = req.params.size

  let cancelOrder = await userHelpers.cancelOrder(req.user._id,orderId ,productId,size )
  res.json({status:true})
})

router.post('/post-review/:id/:pId/:size', async (req, res) => {
  let orderId = req.params.id
  let productId = req.params.pId
  let size = req.params.size
  

  let postReview = await userHelpers.postReview(req.user._id, orderId, productId, size,req.body.review)
  if (postReview) {
    res.redirect('/my-orders')
  }

})



router.post('/payment',isAuth,isBanned, async (req, res) => {

  
  let products = await userHelpers.getCartProductList(req.user._id)
  let userDetails = await userHelpers.getUserDetails(req.user._id)
  let totalAmount = await userHelpers.getTotal(ObjectId(req.user._id))
 
  req.session.amount = totalAmount[0].total
  
  userHelpers.placeOrder(req.body, products, userDetails, totalAmount).then((response) => {
    
    req.session.orderId = response.insertedId
    if (req.body.payment === 'cod') {
      res.json({order:'true',payment:'cod'})
      
    } else if (req.body.payment === 'paytm') {
      
       res.json({order:'true',payment:'paytm',amount:totalAmount.delevery+totalAmount.order})
      
  
    }
   })
 
}),

  
router.get('/search-product/:key',isBanned, async(req, res) => {
  console.log(req.params.key);
  let key = req.params.key

  let products = await userHelpers.searchProducts(key)
  if (products) {
    res.json({status:true,products})
  }

})


module.exports = router;


