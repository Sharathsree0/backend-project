import mongoose  from "mongoose";

const userschema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        passwordhash:{
            type:String,
            required:true,
        }
    },
    {timestamps:true}
);
export default mongoose.model("user",userschema)