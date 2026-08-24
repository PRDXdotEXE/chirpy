import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewToken, refreshTokens } from "../schema.js";

export async function createRefresh(refresh: NewToken) {
    const [result] = await db
        .insert(refreshTokens)
        .values(refresh)
        .onConflictDoNothing()
        .returning();

    return result;
}

export async function getRefreshToken(token: string) {
    const [refreshToken] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, token as string));
    return refreshToken;
}

export async function setRefreshToken(token: string) {
    await db
        .update(refreshTokens)
        .set({
            revokedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(refreshTokens.token, token));
}
