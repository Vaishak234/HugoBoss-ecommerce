var express = require('express');
var router = express.Router();
const passport = require('passport')
const {isLogged ,isAdminAuth,isAdminLogged} = require('../middleware/authMiddleware')
require('../config/passport')(passport)
const { body, validationResult } = require('express-validator');
const authHelpers = require('../helpers/authHelpers');

// user authentication configuration
router.get('/register',isLogged, (req, res) => {
 
  res.render('users/register' ,{title:"HUGO BOSS-register"})
});

router.post('/register',
   body('email','Invalid email').isEmail(),
   body('password','password must be 6 characters long').exists().trim().isLength({ min: 5 }),
   body('mobile', 'Enter a valid mobile number').exists().trim().isLength(10),
   body('email').custom(value => {
       return authHelpers.getEmail(value).then(user => {
      if (user) {
        return Promise.reject('E-mail already in use');
      }
    });
   }),
   body('mobile').custom(value => {
      return authHelpers.getMobile(value).then(user => {
      if (user) {
        return Promise.reject('Mobile number  already registered');
      }
    });
   }),
   
  (req, res) => {

   const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const alert = errors.array()
        console.log(errors);
      res.render('users/register',{alert:alert[0]})
    }
    else {
      authHelpers.registerUser(req.body).then((response) => {
        if (response) {
      res.redirect('/auth/login')
    }
    })
   }
  
    
});

router.get('/login',isLogged, (req, res) => {
  
  res.render('users/login',{title:"HUGO BOSS-login"})
});

router.post('/login', passport.authenticate('local-users',{successRedirect:'/',failureRedirect:'/auth/login',failureFlash:true}) )

router.get('/logout', (req, res) => {
     req.logOut((err) => {
         if(!err) res.redirect('/auth/login')
     })
    
 })

router.get('/google',passport.authenticate('google',{scope:['profile','email']}))

router.get('/google/callback',passport.authenticate('google',{failureRedirect:'/auth/login',successRedirect:'/'}) )

router.get('/user/forgot-password', (req, res) => {
  
  res.render('users/forgotPassword',{title:"HUGO BOSS-forgot-password"})
}) 

router.post('/user/forgot-password', (req, res) => {
  
  authHelpers.generateOtp(req.body.mobile).then(response => {
    req.session.mobile = req.body.mobile
    setTimeout(async() => {
      let deleteOtp = await authHelpers.deleteOtp(req.body.mobile)
      console.log(deleteOtp);
     },60*1000)
    
     res.json(response)  
  })
})

router.post('/user/verify-user', (req, res) => { 

  authHelpers.validateOtp(req.body.otp, req.body.mobile).then(response => {

    console.log(response);
    if (response.otpStatus) {
      res.json({status:true})
    } else  {
      res.json({status:false})
    }
  })
})

router.get('/reset-password', (req, res) => {
  
  res.render('users/resetPassword',{title:"HUGO BOSS-reset-password"})
})

router.post('/reset-password',
  
   body('password', 'password must be 6 characters long').exists().trim().isLength({ min: 5 }),
   body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password does not match ');
    }
    // Indicates the success of this synchronous custom validator
    return true;
   }),

  (req, res) => {

   const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array()
      res.render('users/resetPassword',{alert:alert[0]})
    }
    else {
      
      authHelpers.changePassword(req.session.mobile,req.body.password).then(response => {
        res.redirect('/auth/login')
        req.session.mobile = null
      })
    }
})

//  Admin authentication
router.get('/admin-login',isAdminLogged , (req, res) => {
  
  res.render('admin/login',{title:"Admin-login" })
})

router.post('/admin-login', passport.authenticate('local-admin',{successRedirect:'/admin',failureRedirect:'/auth/admin-login',failureFlash:true}) )

router.get('/admin-logout',isAdminAuth, (req, res) => {
     req.logOut((err) => {
         if(!err) res.redirect('/auth/admin-login')
     })
    
 })






module.exports = router;
