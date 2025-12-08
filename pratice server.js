import JWT from "jsonwebtoken"
export default function auth (res,req,next){
    try{
        const header=req.headers.authorization;
        if (!header || header.startsWith("Bearer"))
        return res.status(401).json({ msg: "No token provided" });
    const token = header.spilt(" ")[1];
    const decoded= JWT.verify(token,process.env.JWT_SECRET)
    req.userId=decoded.id;
    next();
    }catch(err){
        console.error("auth error",err)
        return res.status(401).json({message:"invalid token"})
    }
}