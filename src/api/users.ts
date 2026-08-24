import { Request, Response } from "express";
import { createUser, getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnAuthorizedError } from "../errors/index.js";
import {
    checkPasswordHash,
    hashPassword,
    makeJWT,
    makeRefreshToken,
} from "../lib/auth.js";
import { UserRespose } from "../db/schema.js";

import { config } from "../config.js";
import { createRefresh } from "../db/queries/refresh.js";

export async function create_user(req: Request, res: Response) {
    const email: string = req.body.email;

    const password: string = req.body.password;

    if (!email || typeof email !== "string") {
        throw new BadRequestError("Email is not valid");
    }

    if (!password || typeof password !== "string") {
        throw new BadRequestError("Password is not valid");
    }

    const hashed_password: string = await hashPassword(password);

    const newUser = await createUser({
        email: email,
        hashedPassword: hashed_password,
    });

    if (!newUser) {
        return res.status(409).json({ message: "User already exists" });
    }

    const {
        hashedPassword,

        ...safeUser
    }: { hashedPassword?: string } & UserRespose = newUser;

    res.status(201).json(safeUser);
}

export async function login(req: Request, res: Response) {
    const { email, password } = req.body;

    const accessTokenExpiration = 3600;

    const user = await getUserByEmail(email);
    if (!user) {
        throw new UnAuthorizedError("incorrect email or password");
    }

    const match = await checkPasswordHash(password, user.hashedPassword);

    if (!match) {
        throw new UnAuthorizedError("incorrect email or password");
    }

    const token: string = makeJWT(
        user.id as string,
        accessTokenExpiration,
        config.api.secretJWT,
    );

    const refreshTokenExpiration = new Date();
    refreshTokenExpiration.setDate(refreshTokenExpiration.getDate() + 60);

    const refreshToken: string = makeRefreshToken();

    await createRefresh({
        userId: user.id as string,
        token: refreshToken,
        expiresAt: refreshTokenExpiration,
    });

    const {
        hashedPassword,

        ...safeUser
    }: { hashedPassword?: string } & UserRespose = user;

    const userWithToken = { ...safeUser, token, refreshToken };

    res.status(200).json(userWithToken);
}
