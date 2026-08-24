import argon2 from "argon2";
import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import {
    BadRequestError,
    NotFoundError,
    UnAuthorizedError,
} from "../errors/index.js";
import { randomBytes } from "crypto";
import { getRefreshToken, setRefreshToken } from "../db/queries/refresh.js";
import { config } from "../config.js";
import { chripRedEnable, updatedbHandler } from "../db/queries/users.js";
import { UserRespose } from "../db/schema.js";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
    try {
        return await argon2.hash(password);
    } catch (err) {
        throw new Error(`Password hashing failed: ${err}`);
    }
}

export async function checkPasswordHash(
    password: string,
    hash: string,
): Promise<boolean> {
    try {
        return await argon2.verify(hash, password);
    } catch (err) {
        return false;
    }
}

const TOKEN_ISSUER = "chirpy";
export function makeJWT(
    userID: string,
    expiresIn: number,
    secret: string,
): string {
    const iat = Math.floor(Date.now() / 1000);
    const expat = iat + expiresIn;
    const token = jwt.sign(
        {
            iss: TOKEN_ISSUER,
            sub: userID,
            iat: iat,
            exp: expat,
        } satisfies payload,
        secret,
        { algorithm: "HS256" },
    );

    return token;
}

export function validateJWT(tokenString: string, secret: string) {
    let decoded: payload;
    try {
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (e) {
        throw new BadRequestError("Invalid token");
    }

    if (decoded.iss !== TOKEN_ISSUER) {
        throw new BadRequestError("Invalid issuer");
    }

    if (!decoded.sub) {
        throw new BadRequestError("No user ID in token");
    }

    return decoded.sub;
}

export function getBearerToken(req: Request): string {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        throw new UnAuthorizedError("Something went wrong");
    }
    const parts = authHeader.split(" ");

    if (parts.length === 2 && parts[0].startsWith("Bearer")) {
        return parts[1];
    } else {
        throw new UnAuthorizedError(
            "Invalid Authorization header format. Expected 'Bearer <token>'",
        );
    }
}

export function makeRefreshToken() {
    return randomBytes(32).toString("hex");
}

export async function refreshHandler(req: Request, res: Response) {
    const refreshToken = getBearerToken(req);
    const storedToken = await getRefreshToken(refreshToken);

    if (!storedToken) {
        throw new UnAuthorizedError("Unauthorized");
    }

    if (storedToken.revokedAt) {
        throw new UnAuthorizedError("Unauthorized");
    }

    if (new Date() > new Date(storedToken.expiresAt as Date)) {
        throw new UnAuthorizedError("Unauthorized");
    }

    const expiryTime = 3600;

    const tokenRecived: string = makeJWT(
        storedToken.userId as string,
        expiryTime,
        config.api.secretJWT,
    );

    return res.status(200).json({ token: tokenRecived });
}

export async function revokeHandler(req: Request, res: Response) {
    const refreshToken: string = getBearerToken(req);
    await setRefreshToken(refreshToken);

    return res.status(204).send();
}

export async function updateHandler(
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

        const { email, password } = req.body;
        if (!email || !password) {
            throw new BadRequestError("email and password is required");
        }

        const hashedPass = await hashPassword(password);

        const userRes = await updatedbHandler(userId, email, hashedPass);

        if (!userRes) {
            throw new NotFoundError("User not found");
        }

        const {
            hashedPassword,
            ...safeUser
        }: { hashedPassword?: string } & UserRespose = userRes;

        res.status(200).json(safeUser);
    } catch (err) {
        next(err);
    }
}

type WebhookPayload = {
    event: string;
    data: {
        userId: string;
    };
};

export async function handlerWebhook(req: Request, res: Response) {
    type parameters = {
        event: string;
        data: {
            userId: string;
        };
    };

    const apiKey = getAPIKey(req);
    if (apiKey !== config.api.polkaKey) {
        throw new UnAuthorizedError(
            "You are not allowd to access this feature ",
        );
    }

    const params: parameters = req.body;

    if (params.event !== "user.upgraded") {
        res.status(204).send();
        return;
    }

    const upgradedUser = await chripRedEnable(params.data.userId);
    if (!upgradedUser) {
        res.status(404).send();
        return;
    }

    res.status(204).send();
}

function getAPIKey(req: Request): string {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        throw new UnAuthorizedError("Authorization header missing");
    }
    const parts = authHeader.split(" ");

    if (parts.length === 2 && parts[0] === "ApiKey") {
        return parts[1];
    } else {
        throw new UnAuthorizedError(
            "Invalid Authorization header format. Expected 'ApiKey <key>'",
        );
    }
}
