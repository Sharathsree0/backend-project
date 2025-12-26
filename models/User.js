import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required:true },
    passwordHash: String,
    isAdmin:{type:Boolean,default:false},
image: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg" 
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
