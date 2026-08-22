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
import { chrips_validtaor, getChirps, getChirp } from "./api/chirps.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { migrate } from "drizzle-orm/postgres-js/migrator";
import { create_user } from "./api/users.js";

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

app.get("/admin/metrics", handlerAdminMetrics, handlerHits);

app.post("/admin/reset", middlewareReset, handlerReset);

app.post("/api/healthz", handlerReadiness);

app.post("/api/users", create_user);

app.post("/api/chirps", chrips_validtaor);
app.post("/api/login");
app.get("/api/chirps", getChirps);
app.get("/api/chirps/:chirpId", getChirp);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
