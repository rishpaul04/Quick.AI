import { clerkClient } from "@clerk/express";


export const auth=async(req,res,next)=>{
    try{
        // Authentication logic here
        const {userId,has}=req.auth;
        const hasPremiumPlan=await has({plan:'premium'});
        const user=await clerkClient.users.getUser(userId);
        if(!hasPremiumPlan && user.privateMetadata.freeusage){
            req.free_usage=user.privateMetadata.freeusage;
        }   else{
            await clerkClient.users.updateUser(userId,{
                privateMetadata:{freeusage:0}
            });
            req.free_usage=0;   
        }
        req.plan=hasPremiumPlan?'premium':'free';
        next();
    }catch(error){
        res.json(success=false,message="Authentication failed");

    }
}
