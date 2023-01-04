const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const exphbs = require('express-handlebars')
const hbs = require('handlebars')
const session = require('express-session')
const passport = require('passport');
const flash = require('express-flash')
const db = require('./config/connections')
const dotenv = require('dotenv')
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const paymentRouter = require('./routes/payment');

const app = express();
dotenv.config()

const port = process.env.PORT

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',exphbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layouts/',partialsDir:__dirname+'/views/partials/'}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//middlewares for static files
app.use('/css',express.static(path.join(__dirname, 'public/stylesheets')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/js', express.static(path.join(__dirname, 'public/javascripts')));
app.use('/uploads', express.static(path.join(__dirname, 'public/products-uploads')));

//express-session configuration
app.use(session({
  secret: 'this is a secret key',
  saveUninitialized: false,
  resave: false,
  cookie: { maxAge: 60000000 },
  store:db.store
}))

app.use(flash())


//passport strategy configuration 
app.use(passport.initialize())
app.use(passport.session())



app.use((req, res, next)=> {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});


// database connection 
db.connect((err) => {
  if (err) console.log('database connection error', err);
  else console.log('database connected...');
})

//routes middlewares
app.use('/', usersRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/payment', paymentRouter);



app.listen(port, () => {
  console.log('server is running ......');
})

