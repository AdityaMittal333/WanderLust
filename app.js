if(process.env.NODE_ENV!="production"){
  require('dotenv').config();
}
const express = require("express"); 
const app = express(); //
const mongoose = require("mongoose"); 
const path = require("path");
const methodOverride = require("method-override"); 
const ejsMate=require("ejs-mate"); 
const ExpressError = require("./utils/ExpressError.js"); 
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); 
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
 
//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
 const dbUrl=process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}

main();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public"))); 

const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600, // if not change happen while using website then session update after 24hr
});

store.on("error",()=>{
  console.log("Error in MONGO Session Store",err);
})
const sessionOptions = { // layout of session
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now()+7*24*60*60*1000, //expiry date of cookie
    maxAge: 7*24*60*60*100,
    httpOnly:true, //save app from cross-scripting attack
  }
}

//root route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});



app.use(session(sessionOptions)); // use for session id , this is a middleware
app.use(flash()); //this is a middleware

app.use(passport.initialize());
app.use(passport.session()); //  use , session herejis se server ko pata ho ki ye ek he session chalra h aur hame baar baar authentication na karna padhe
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // to serial the user means to store user related info in one session
passport.deserializeUser(User.deserializeUser()); // to deserial the user means to delete user related info in one session

app.use((req,res,next)=>{ 
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser=req.user;
  next();
})




app.use("/listings",listingsRouter); // to use from routes/listing
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);


//middleware to handle error
app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page not found"));
});

app.use((err, req, res, next) => {
  let {statusCode=500,message="something get wrong!"}  = err;
  // res.status(statusCode).send(message);
  res.render("listings/error.ejs",{err});
 
});


app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
 