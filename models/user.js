const mongoose = require("mongoose");
const{Schema}= mongoose;
const UserSchema = new Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    role:{
        type:String,
        default:"user"
    },
})



const UserModel = mongoose.model("Users", UserSchema)
module.exports = UserModel;