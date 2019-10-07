const express = require('express'); // 
const path = require('path'); // 
const logger = require('morgan'); // https://www.npmjs.com/package/morgan
const session = require('express-session'); // https://www.npmjs.com/package/express-session
const cookieParser = require('cookie-parser')
const expressValidator = require('express-validator'); //https://www.npmjs.com/package/express-validator
const nodemailer = require('nodemailer');

let app = express();

// Connected views folder
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// connect static folder
app.use(express.static(path.join(__dirname, 'public')))
// enable req.body using HTML form
app.use(express.urlencoded({ extended: false }));

app.use(logger('dev'))

// let the app work with JSON
app.use(express.json())
app.use(cookieParser('super-secret'))

let user = {};

app.use(session({
  secret: 'super-secret',
  saveUninitialized: false,
  resave: false,
  cookie: { //save information on users side.
    secure: false, // Eventually manually change to TRUE
    maxAge: 365 * 24 * 60 * 60 * 1000, //to keep cookies for a year
  }
}))

app.use(expressValidator({
  errorFormatter: (param, message, value) => {
    let namespace = param.split('.');
    let root = namespace.shift();
    let formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']'
    }
    return {
      param: formParam,
      message: message,
      value: value
    }
  }
}))

app.get('/', (req, res, next) => {
  // console.log(req.session);
  // console.log(req.session.cookie);
  // console.log(`req`, req.query);

  if (Object.keys(req.query).length != 0) {
    console.log(req.query);
    next()
    return
  };

  res.render('index')
})

app.get('/', (req, res, next) => {
  // console.log(req.session);
  // console.log(req.session.cookie);
  console.log(`req`, req.query);
  res.send('req.query')
})

app.post('/', (req, res) => {
  // console.log(req.body);

  res.send(req.body)
})

app.get('/user/register', (req, res) => {
  res.render('register', { error_msg : false })

})
//Register input form
app.post('/users/register', (req, res) => {
  console.log(`req.body`, req.body);

  req.checkBody('username', 'Between 3 and 15 characters').isLength({ min: 3, max: 15 });
  req.checkBody('username', 'only use Letters').notEmpty().blacklist(new RegExp('[^A-Za-z]'));
  req.checkBody('email', 'Enter a valid Email address').isEmail();
  req.checkBody('password2', 'Passwords do not match').notEmpty().equals(req.body.password);

  let errors = req.validationErrors()

  if(errors) {
    res.render('register', { error_msg: true, errors: errors })
  } else {
    user.username = req.body.username;
    user.email = req.body.email;
    user.password = req.body.password;

    req.session.user = user;

    res.redirect('/show-me-my-page')
  }
  // console.log(`errors`, errors);

  // res.send('post register')
})

// app.get('./users/contact', (req, res) => {
//   console.log(`req`, req.query);
//   res.render('register', { error_msg : false })
  
// })


//-------------------------------------
//Contact
app.get('/contact', (req, res) => {
  res.render('contact', { error_msg : false })

})

app.post('/contact', (req, res) => {
  console.log(`req.body`, req.body);

  req.checkBody('username', 'Between 3 and 15 characters');
  // req.checkBody('username', 'only use Letters').notEmpty().blacklist(new RegExp('[^A-Za-z]'));
  req.checkBody('email', 'Enter a valid Email address').isEmail();
  // req.checkBody('password2', 'Passwords do not match').notEmpty().equals(req.body.password);

  let errors = req.validationErrors()

  if(errors) {
    res.render('contact', { error_msg: true, errors: errors })
  } else {

    let mailOptions = {
      from: 'john.stilwell@codeimmersives.com',
      to: 'john.stilwell@codeimmersives.com',
      subject: `${req.body.username} Sent you a message`,
      text: req.body.input,
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if(error) console.log(error);
      else console.log(`email sent: ${info.response}` );
    })
    
    

    res.redirect('/contact/success')
  }
  // console.log(`errors`, errors);

  // res.send('post register')
})

// app.get('./users/contact', (req, res) => {
//   console.log(`req`, req.query);
//   res.render('register', { error_msg : false })
  
// })

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'john.stilwell@codeimmersives.com',
    pass: 'password'
  }
})





app.get('/show-me-my-page', (req, res) => {

if(req.session.user) {
  res.render(`index`, { user: req.session.user })
} else {
  res.render(`index`, { user: null })
}
  // res.send('Hello')
  // res.render('index')
})

app.get('/contact/success/', (req, res) => {

  if(req.session.user) {
    res.render(`index`, { user: req.session.user })
  } else {
    res.render(`index`, { user: null })
  }
    // res.send('Hello')
    // res.render('index')
  })





app.get('/test', (req, res) => {

  res.render('index')

  // res.send('<h1>Test HTML</h1>')
})

//place this above app.listen
app.get('*', (req, res) => {
  res.send('got request to *')
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
})

