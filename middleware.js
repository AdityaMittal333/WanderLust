const Listing = require("./models/listing");
const {listingSchema,reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");//
const Review = require("./models/review.js");

module.exports.isLoggedIn=(req,res,next)=>{
  if(!req.isAuthenticated()){
    req.session.redirectUrl = req.originalUrl; // after every successful login passport erase the detail like originalUrl so our redirectUrl will empty in user.js 
    req.flash("error","you must be logged in!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner  = async(req,res,next) => {
  let {id} = req.params;
  let listing=await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings"); // Redirect to a safe page
  }
  
  if(!listing.owner._id.equals(res.locals.currUser._id)){
    req.flash("error","You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
//to validate new listing which come from hopsotch
module.exports.validateListing = (req,res,next)=>{
  let {error} = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    return next(new ExpressError(400, errMsg)); // Ensure next() is called with error
  }
  
  else{
    next();
  }
}
//to validate review which come from hopsotch
module.exports.validateReview = (req,res,next)=>{
  let {error} = reviewSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el)=> el.message).join(", ");
    throw new ExpressError(400,errMsg);
  }
  else{
    next();
  }
} 

// middleware.js
module.exports.isReviewAuthor  = async(req,res,next) => {
  let {id,reviewId} = req.params;
  let review = await Review.findById(reviewId);
  
  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You did not create this review");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
