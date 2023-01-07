const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const { Passport } = require('passport')
const db = require('./connections')
const googleStrategy = require('passport-google-oauth20').Strategy
const collections = require('./collections')
const dotenv = require('dotenv')
dotenv.config()

//passport-local strategy  configuration for users
module.exports = function (passport) {
    passport.use('local-users',new LocalStrategy({ usernameField: 'email' }, (async(email, password, done) => {
        const user = await db.get().collection(collections.USERS_COLLECTION).findOne({ email: email ,authType:'local'})   //Fetch user from database
        //check user exist or not
        if (!user) {
            return done(null,false,{message:'no user found'}) //if user not exist , return null user with an error message.
        } else {
            const isMatch = await bcrypt.compare(password, user.password)     //if user exist , compare password using bcryptjs library.
          
            if (isMatch) {
                user.role = "user"
                user.banned =false       //add a role to user credentials for identify the role of login
                return done(null,user)     //if password matches , return the user credentials 
            } else {
                return done(null,false,{message:'incorrect password'})     //if password dosenot matches , return the nul user eith an error message.
            }
        }
    })
    )),
        
//passport-local strategy  configuration for admin login

 passport.use('local-admin',new LocalStrategy({ usernameField: 'email' }, (async(email, password, done) => {
    const user = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ email: email ,authType:'local'})
     if (!user) {
        return done(null,false,{message:'no user found'})
    } else {
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            user.role = 'admin'
            console.log(user);
            return done(null,user)
        } else {
            return done(null,false,{message:'incorrect password'})
        }
    }
})
)),

// passsport-google strategy for users login.......
 passport.use(new googleStrategy({

    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_CLIENTSECRET,
    callbackURL: process.env.GOOGLECALLBACK_URL,
    passReqToCallback: true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    
      const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
          email:profile.emails[0].value,
          authType: 'google',
          role: 'user',
          banned: false,
         
      }
      try {
        
        let user = await db.get().collection(collections.USERS_COLLECTION).findOne({ googleId: profile.id ,authType:'google'})
            
          if (user) {
               user.role = 'user'
               user.banned =false 
              done(null,user)
          } else {
            user = await db.get().collection(collections.USERS_COLLECTION).insertOne(newUser)
              done(null, newUser)
          }
          
      } catch (error) {
        console.log(error);
      }
  }
)),

//passport serilization
passport.serializeUser((user, done) => {
        let userdetails = {
            authType: user.authType,
            userId:user._id,
            role:user.role,
        }
         return done(null,userdetails)
     }),
   
//passport deserialization
  passport.deserializeUser(async (userdetails , done) => {
        
      if (userdetails.role === 'user') {
          let user = await db.get().collection(collections.USERS_COLLECTION).findOne({ _id: userdetails.userId, authType: userdetails.authType })
           
          return done(null, user)
      }
      else if (userdetails.role === 'admin') {
          let user = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ _id: userdetails.userId, authType: userdetails.authType })
          return done(null, user)
      }
            
 })
 
  
    
}