import { type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { chirps } from "../db/schema.js";
import { createChrips } from "../db/queries/chripsdb.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";

export async function chrips_validtaor(req: Request, res: Response) {
    type Parameters = {
        body: string;
        userId: string;
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

    const chirp = await createChrips({
        ...parsedBody,
        body: cleanedBody,
    });

    res.status(201).json({
        id: chirp.id,
        createdAt: chirp.createdAt,
        updatedAt: chirp.updatedAt,
        body: chirp.body,
        userId: chirp.userId,
    });
}

export async function getChirps(req: Request, res: Response) {
    const allChirps = await db.select().from(chirps).orderBy(chirps.createdAt);

    res.status(200).json(allChirps);
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
