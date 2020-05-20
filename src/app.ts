import express from "express";
import bodyParser from "body-parser";
import routes from "./controller";

const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use("/", routes);

export default app;
