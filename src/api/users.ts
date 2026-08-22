import { Request, Response } from "express";
import { createUser, getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnAuthorizedError } from "../errors/index.js";
import { checkPasswordHash, hashPassword } from "../lib/auth.js";
import { chirps, UserRespose } from "../db/schema.js";
import { db } from "../db/index.js";

export async function create_user(req: Request, res: Response) {
    const email: string = req.body.email;

    const password: string = req.body.password;

    if (!email || typeof email !== "string") {
        throw new BadRequestError("Email is not valid");
    }

    if (!password || typeof password !== "string") {
        throw new BadRequestError("Password is not valid");
    }

    const hashedPassword: string = await hashPassword(password);

    const newUser = await createUser({ email, hashedPassword });

    if (!newUser) {
        return res.status(409).json({ message: "User already exists" });
    }

    const {
        hashed_password,

        ...safeUser
    }: { hashed_password?: string } & UserRespose = newUser;

    res.status(201).json(safeUser);
}

export async function getChirps(req: Request, res: Response) {
    const [result] = await db.select().from(chirps).orderBy(chirps.createdAt);

    res.status(200).json(result);
}
