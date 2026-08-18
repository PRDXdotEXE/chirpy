import express, {
    type NextFunction,
    type Express,
    type Request,
    type Response,
} from "express";

import { config } from "./config.js";

const app: Express = express();
const PORT = 8080;

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits += 1;
    next();
}
function middlewareReset(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits = 0;
    next();
}

const handlerAdminMetrics = (req: Request, res: Response) => {
    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(`<html>
    <body>
      <h1>Welcome, Chirpy Admin</h1>
      <p>Chirpy has been visited ${config.fileserverHits} times!</p>
    </body>
  </html>`);
};

const handlerHits = (req: Request, res: Response) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits: ${config.fileserverHits}`);
};

const handlerReset = (req: Request, res: Response) => {
    config.fileserverHits = 0;
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("OK");
};

const middlewareLogResponses = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    res.on("finish", () => {
        const status = res.statusCode;
        if (status != 200) {
            console.log(
                `[NON-OK] ${req.method} ${req.url} - Status: ${status}`,
            );
        }
    });
    next();
};

app.use(
    "/app",
    middlewareMetricsInc,
    express.static("./src/app"),

    middlewareLogResponses,
);

app.get("/admin/metrics", handlerAdminMetrics, handlerHits);
app.post("/admin/reset", middlewareReset, handlerReset);

app.post("/api/healthz", (req: Request, res: Response) => {
    res.set({
        "content-type": "text/plain",
        charset: "utf-8",
    });
    res.send("OK");
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
