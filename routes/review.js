const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");//
const {reviewSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");//
const Listing = require("../models/listing.js"); //
const {validateReview,isLoggedIn,isReviewAuthor} = require("../middleware.js"); 
const Review = require("../models/review.js"); // Add this line
const reviewController  = require("../controllers/reviews.js");



//post review route
router.post("/",isLoggedIn,validateReview, wrapAsync(reviewController.createReview));

//review delete route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports =  router;