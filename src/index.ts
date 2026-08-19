import express, {
    type NextFunction,
    type Express,
    type Request,
    type Response,
} from "express";

import { config } from "./config.js";

import { handlerAdminMetrics, handlerHits } from "./api/metrics.js";

import { middlewareReset, handlerReset } from "./api/reset.js";

import { handlerReadiness } from "./api/readiness.js";

const app: Express = express();
const PORT = 8080;

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits += 1;
    next();
}

const middlewareLogResponses = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    res.on("finish", () => {
        const status = res.statusCode;

        if (status !== 200) {
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

app.post("/api/healthz", handlerReadiness);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
