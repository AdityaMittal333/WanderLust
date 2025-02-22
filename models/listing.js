const mongoose =require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listeningSchema = new Schema({
  title:{
    type:String,
    required:true
  }, 
  description:{
    type:String
  },
  image:{
    filename:String,
    url:String,
  },
  price:{
    type:Number
  }, 
  location:{
    type:String
  },
  country:{
    type:String
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
  }
});

// this is a post type middleware which run when we delete a listing
listeningSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id : {$in: listing.reviews}});
  }
});

const Listing = mongoose.model("Listing",listeningSchema);
module.exports=Listing; 

