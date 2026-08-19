import type { Request, Response,NextFunction } from "express";
import { config } from "../config.js";

export const middlewareReset = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    config.fileserverHits = 0;
    next();
};

export const handlerReset = (req: Request, res: Response) => {
    config.fileserverHits = 0;

    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("OK");
};
