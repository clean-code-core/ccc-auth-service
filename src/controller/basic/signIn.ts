import express, { Request } from "express";
const router = express.Router();

interface SignInModel {
    loginId: string;
    password: string;
}

router.post("/signIn", function(req: Request<{},{},SignInModel>, res){
    const {loginId, password} = req.body;

    
    
    res.send({reference:"/controller/basic/signIn"});
});

export default router;