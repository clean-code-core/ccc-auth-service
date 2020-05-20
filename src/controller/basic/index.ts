import express from "express";
import signIn from "./signIn";
import signOut from "./signOut";

const router = express.Router();

router.use("/", signIn);
router.use("/", signOut);

export default router;
