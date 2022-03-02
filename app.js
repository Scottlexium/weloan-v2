const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
dotenv.config();
const cors = require('cors');


const bodyParser = require('body-parser')
const port = process.env.PORT || 4659;
const mongoose = require('mongoose');
const moment = require('moment');
const session = require('express-session');
const {checkUser} = require('./middleware/authMiddleware');
// Option 3: Passing parameters separately (other dialects)

app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(cors());

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));


const dbURI = process.env.MONGODB_URI
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=> {
    app.listen(port);
    console.log(`Db connected, now listening on http://localhost:${port}`);
})
.catch(err=> console.log(err));



// app.use(expressLayouts);

app.get('*', checkUser);
app.get('/set-cookie', (req, res)=>{
  res.cookie('newUser', false, {maxAge: 1000*60*60*24, httpOnly: true});
  res.send("gotten cookies");
})


app.get('/personal', (req , res)=>{
  res.render('personal');
})
app.get('/get-cookie', (req, res)=>{
  const cookies = req.cookies;
  console.log(cookies.newUser);
  res.json(cookies)
})

app.use(authRoutes);
// routes
app.use((req, res, next) => {
  res.render('404');
    // res.status(404).send(
    //     "<h1>Page not found on the server</h1>")
})
