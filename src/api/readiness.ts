import type { Request, Response } from "express";

export const handlerReadiness = (req: Request, res: Response) => {
    res.set({
        "content-type": "text/plain",
        charset: "utf-8",
    });

    res.send("OK");
};
