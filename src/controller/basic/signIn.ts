import express, { Request, Response } from "express";
import { signIn } from "../../adapter/mariadb/signIn";
const router = express.Router();

interface SignInModel {
    loginId: string;
    password: string;
}

router.post("/signIn", function(req: Request<{},{},SignInModel>, res: Response){
    console.log("controller.basic.signIn");
    const {loginId, password} = req.body;
    if(loginId === undefined || password === undefined){
        res.sendStatus(400);
        return;
    }
    signIn(loginId, password).then(r=>{
        if(r.profile){
            res.send(r);
        } else {
            if(r.error && r.error.code){
                res.status(r.error.code);
            } else {
                res.status(500);
            }
            res.send(r.error);
        }
    })
    .catch(r=>{
        res.status(500);
        res.send(r);
    });
});

export default router;