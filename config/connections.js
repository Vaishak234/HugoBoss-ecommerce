const mongoClient = require('mongodb').MongoClient
const session =  require('express-session')
const mongoDbStore = require('connect-mongodb-session')(session)
const dotenv = require('dotenv')
const collections = require('./collections')
dotenv.config()

// Mongodb database configuration
const state = {
    db:null
}
    const url = process.env.MONGO_URL                     //database connection url
    const dbname = collections.DBNAME                     // database name

module.exports.connect = function(done){
   
    mongoClient.connect(url,{ useUnifiedTopology: true },(err,data)=>{
        if(err) return done(err)  //returns error when error occures in database connection

        state.db = data.db(dbname)
        done()
    }).catch((error) => {
        return done(error) 
    })
}

module.exports.get = function(){
    return state.db
}

// Mongodb session storage configuration
module.exports.store = new mongoDbStore({
    uri: url,
    databaseName: dbname,
    collection: collections.SESSIONSTORE__COLLECTION                     //sesion storage collection name
})