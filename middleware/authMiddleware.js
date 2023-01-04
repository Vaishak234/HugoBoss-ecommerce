const userHelpers = require('../helpers/userHelpers')
require('dotenv').config()

module.exports = {

    //redirect to login page when  the is not loggedin 
    isAuth: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect("/auth/login");
        }
    },
    
    isLogged: (req, res, next) => {
        if (req.user) {
            res.redirect('/')
        } else {
            next()
        }
    },
    isAdminAuth: (req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.redirect("/auth/admin-login");
        }
    },
    isAdminLogged: (req, res, next) => {
        if (req.user) {
            res.redirect('/admin')
        } else {
            next()
        }
    },
    isBanned:async(req, res ,next) => {
        let isBanned = await userHelpers.getBannedUser(req.user._id)

        if (isBanned) {
            res.render('users/bannedPage', { title: `HUGO BOSS` })
        } else {
            next()
        }
    },
    isAdmin: (req,res,next) => {
        if (req.user.email === process.env.ADMIN_EMAIL) {
            next()
        } else {
            req.logout(()=>{})
        }
    },
    isUser: (req,res,next) => {
        if (req.user.email !== process.env.ADMIN_EMAIL) {
            next()
        } else {
            req.logout(()=>{})
        }
    }
}