import express from "express";
import basic from "./basic";

const router = express.Router();

router.use("/basic", basic);

export default router;
