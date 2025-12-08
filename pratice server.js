import JWT, { verify } from "jsonwebtoken";

export default function Auth (req,res,next){
    try{
        const header = req.headers.authorization;
        if(!header || !header.startsWith("Bearer")){
            return res.status(401).json({message:"no token provided"})
        }
        const token= header.split(" ")[1];
        const decoded = JWT.verify(token,process.env.JWT_SECRET);

        req.userId= decoded.id;
        next();

    }catch(err){
        console.error("auth error",err)
        return res.status(401).json({message:"invalid token"})
    }
}