import type { Request, Response } from "express";
import { config } from "../config.js";

export const handlerAdminMetrics = (req: Request, res: Response) => {
    res.set("Content-Type", "text/html; charset=utf-8");

    res.send(`<html>
    <body>
      <h1>Welcome, Chirpy Admin</h1>
      <p>Chirpy has been visited ${config.fileserverHits} times!</p>
    </body>
  </html>`);
};

export const handlerHits = (req: Request, res: Response) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits: ${config.fileserverHits}`);
};
