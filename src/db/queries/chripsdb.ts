import { db } from "../index.js";
import { Newchirp, chirps } from "../schema.js";

export async function createChrips(chrip: Newchirp) {
    const [result] = await db
        .insert(chirps)
        .values(chrip)
        .onConflictDoNothing()
        .returning();
    return result;
}
