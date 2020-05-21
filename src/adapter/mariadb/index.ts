import { Request, Response, NextFunction } from "express";

// eslint-disable-next-line @typescript-eslint/no-empty-function
function adapter(req: Request, res: Response, next: NextFunction): void{
    if(req.url === "signIn" && req.method.toLowerCase() === "post"){

    }
}

export default adapter;