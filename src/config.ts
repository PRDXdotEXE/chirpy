import { loadEnvFile } from "node:process";

loadEnvFile();

import type { MigrationConfig } from "drizzle-orm/xata-http/migrator";

type APIConfig = {
    fileServerHits: number;
    platform: string;
    secretJWT: string;
    polkaKey: string;
};

type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
};

type Config = {
    api: APIConfig;
    db: DBConfig;
};
export const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
    api: {
        fileServerHits: 0,
        platform: process.env.PLATFORM!,
        secretJWT: process.env.SECRET_JWT!,
        polkaKey: process.env.POLKA_KEY!,
    },
    db: {
        url: process.env.DB_URL!,
        migrationConfig: migrationConfig,
    },
};
