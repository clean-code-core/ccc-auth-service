import express from "express";
const router = express.Router();

router.get("/signOut", function(_, res){
    res.send("/controller/basic/signOut");
});

export default router;