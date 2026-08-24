import { type NextFunction, type Request, type Response } from "express";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { chirps } from "../db/schema.js";
import { createChrips, deleteChrips } from "../db/queries/chripsdb.js";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    UnAuthorizedError,
} from "../errors/index.js";
import { getBearerToken, validateJWT } from "../lib/auth.js";
import { config } from "../config.js";

export async function chrips_validtaor(req: Request, res: Response) {
    type Parameters = {
        body: string;
    };

    const parsedBody: Parameters = req.body;
    const maxChirpLength = 140;
    const profane = ["kerfuffle", "sharbert", "fornax"];

    if (!parsedBody.body || parsedBody.body.length > maxChirpLength) {
        throw new BadRequestError(
            `Chirp is too long. Max length is ${maxChirpLength}`,
        );
    }

    const words = parsedBody.body.split(" ");
    for (let i = 0; i < words.length; i++) {
        const lowerWord = words[i].toLowerCase();
        if (profane.includes(lowerWord)) {
            words[i] = "****";
        }
    }

    const cleanedBody = words.join(" ");

    try {
        const bToken = getBearerToken(req);

        const id = validateJWT(bToken, config.api.secretJWT);

        if (!id) {
            res.status(401).send("Unauthorized");
            return;
        }

        const chirp = await createChrips({
            userId: id,
            body: cleanedBody,
        });

        res.status(201).json({
            id: chirp.id,
            createdAt: chirp.createdAt,
            updatedAt: chirp.updatedAt,
            body: chirp.body,
            userId: chirp.userId,
        });
    } catch (error) {
        res.status(401).send("Unauthorized");
    }
}

export async function getChirps(req: Request, res: Response) {
    const sort = req.query.sort === "desc" ? "desc" : "asc";
    const authorId =
        typeof req.query.authorId === "string" ? req.query.authorId : null;

    const orderFn =
        sort === "desc" ? desc(chirps.createdAt) : asc(chirps.createdAt);

    let query = db.select().from(chirps);

    const result = await db
        .select()
        .from(chirps)
        .where(authorId ? eq(chirps.userId, authorId) : undefined)
        .orderBy(orderFn);

    return res.status(200).json(result);
}

export async function getChirp(req: Request, res: Response) {
    const { chirpId } = req.params;

    const [chirp] = await db
        .select()
        .from(chirps)
        .where(eq(chirps.id, chirpId as string));

    if (!chirp) {
        throw new NotFoundError("No such chirp exists");
    }

    res.status(200).json(chirp);
}

export async function delChirp(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        let userId: string;
        try {
            const tokenString = getBearerToken(req);
            userId = validateJWT(tokenString, config.api.secretJWT);
        } catch (error) {
            throw new UnAuthorizedError("Unauthorized");
        }

        const { chirpId } = req.params;
        const [chirp] = await db
            .select()
            .from(chirps)
            .where(eq(chirps.id, chirpId as string));

        if (!chirp) {
            throw new NotFoundError("No such chirp exists");
        }

        if (chirp.userId !== userId) {
            throw new ForbiddenError("You can't access that");
        }

        await deleteChrips(chirpId as string);

        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
