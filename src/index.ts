import express, {
    type NextFunction,
    type Express,
    type Request,
    type Response,
} from "express";

import { config } from "./config.js";

import { handlerAdminMetrics } from "./api/metrics.js";

import { middlewareReset, handlerReset } from "./api/reset.js";

import { handlerReadiness } from "./api/readiness.js";
import {
    chrips_validtaor,
    getChirps,
    getChirp,
    delChirp,
} from "./api/chirps.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { migrate } from "drizzle-orm/postgres-js/migrator";
import { create_user, login } from "./api/users.js";
import {
    handlerWebhook,
    refreshHandler,
    revokeHandler,
    updateHandler,
} from "./lib/auth.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app: Express = express();
const PORT = 8080;

app.use(express.json());

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.api.fileServerHits += 1;
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

app.get("/admin/metrics", handlerAdminMetrics);

app.post("/admin/reset", middlewareReset, handlerReset);

app.post("/api/healthz", handlerReadiness);

app.post("/api/users", create_user);

app.post("/api/chirps", chrips_validtaor);
app.post("/api/login", login);
app.post("/api/refresh", refreshHandler);
app.post("/api/revoke", revokeHandler);
app.post("/api/polka/webhooks", handlerWebhook);
app.get("/api/chirps", getChirps);
app.get("/api/chirps/:chirpId", getChirp);
app.put("/api/users", updateHandler);
app.delete("/api/chirps/:chirpId", delChirp);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
