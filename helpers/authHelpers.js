const db = require('../config/connections')
const collections = require('../config/collections')
const ObjectId = require('mongodb').ObjectId
const bcrypt = require('bcryptjs')
const otpGenerator = require('otp-generator')
const dotenv = require('dotenv')
dotenv.config()

var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console

const twilio = require('twilio')(accountSid,authToken)

module.exports = {
    registerUser: (userDetails) => {
        return new Promise(async (resolve, reject) => {
            let hashedPassword = await bcrypt.hash(userDetails.password, 10)
            userDetails.password = hashedPassword
            userDetails.authType = 'local'
           
            if (hashedPassword) {
                db.get().collection(collections.USERS_COLLECTION).insertOne(userDetails).then(async (response) => {
                    if (response) {
                        resolve(response)
                        console.log(response);
                    }
                }).catch(error => {
                throw error
            })
            }
        })
    },
    getEmail: (email) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.USERS_COLLECTION).findOne({ email: email }).then((user) => {
            resolve(user)
         }).catch(error => {
                throw error
            })
      })
    },
    getMobile: (mobile) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.USERS_COLLECTION).findOne({ mobile:mobile }).then((user) => {
            resolve(user)
         }).catch(error => {
                throw error
            })
      })
    },
     generateOtp: (mobile) => {
      return new Promise(async (resolve, reject) => {
         try {
             let mobileExist = await db.get().collection(collections.USERS_COLLECTION).findOne({ mobile: mobile, authType: 'local' })
         if (mobileExist) {
            let otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
            let hashedOtp = await bcrypt.hash(otp, 10)
        
            twilio.messages.create({
               from: process.env.TWILIO_MOBILENUMBER,
               to: `+91${mobile}`,
               body: `your otp for change password is ${otp} ,otp is valid for 60 second`,
            }).then(async (res) => {
                
               let otpExist = await db.get().collection(collections.OTP_COLLECTION).findOne({ mobile: mobile })
               if (otpExist) {
                  db.get().collection(collections.OTP_COLLECTION).updateOne({ mobile: mobile }, { $set: { otp: hashedOtp } }).then((response) => {
                     resolve({ status: true })
                  })
               } else {
                  db.get().collection(collections.OTP_COLLECTION).insertOne({ mobile, otp: hashedOtp }).then((response) => {
                     resolve({ status: true })
                  })
               }
            }).catch(error => {
               console.log(error);
            })

         } else {
            resolve({ status: false, message: 'user not exist with this mobile number' })
         }
         } catch (error) {
            throw error
         }
         
         
      })
   },
   validateOtp: (otp, mobile) => {
      return new Promise(async (resolve, reject) => {
         try {
             let otpExist = await db.get().collection(collections.OTP_COLLECTION).findOne({ mobile: mobile })
         if (otpExist) {
            db.get().collection(collections.OTP_COLLECTION).findOne({ mobile: mobile }).then((data) => {
               bcrypt.compare(otp, data.otp).then(response => {
                  resolve({ otpStatus: response })
               })
            })
         } else {
            resolve({ otpStatus: false })
         }
         } catch (error) {
            throw error
         }
         
      })
   },
   changePassword: (mobile, password) => {
      return new Promise(async (resolve, reject) => {
         const hashedPassword = await bcrypt.hash(password, 10)
         db.get().collection(collections.USERS_COLLECTION).updateOne({ mobile: mobile, authType: "local" },
            {
               $set: { password: hashedPassword }
            }
         ).then((response) => {
            resolve(response)
         }).catch(error => {
                throw error
            })
      })
   },
   deleteOtp: (mobile) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collections.OTP_COLLECTION).deleteOne({ mobile: mobile }).then((response) => {
            resolve(response)
         }).catch(error => {
                throw error
            })
      })
   },

}