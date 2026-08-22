import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { ForbiddenError } from "../errors/index.js";


import { resetUsers } from "../db/queries/users.js";

export const middlewareReset = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    config.api.fileServerHits = 0;
    next();
};

export async function handlerReset(req: Request, res: Response) {
    if (config.api.platform != "dev") {
        throw new ForbiddenError("403 Forbidden");
    }
    config.api.fileServerHits = 0;
    await resetUsers();

    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("OK");
}
