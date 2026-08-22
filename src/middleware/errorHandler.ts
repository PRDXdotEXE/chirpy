import { Request, Response, NextFunction } from "express";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    UnAuthorizedError,
} from "../errors/index.js";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (err instanceof NotFoundError)
        return res.status(404).json({ error: err.message });
    if (err instanceof BadRequestError)
        return res.status(400).json({ error: err.message });
    if (err instanceof UnAuthorizedError)
        return res.status(401).json({ error: err.message });
    if (err instanceof ForbiddenError)
        return res.status(403).json({ error: err.message });

    return res.status(500).json({ error: "Something went wrong on our end" });
}
