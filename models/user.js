const mongoose =require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email:{
    type:String,
    required:true
  } // we dont need to create password and username in the schema because "passport-local-mongoose" automatically create password and username with salting and hashing 
}) ;

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',userSchema);