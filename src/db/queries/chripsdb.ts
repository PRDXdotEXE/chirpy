import { eq } from "drizzle-orm";
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



export async function deleteChrips(id: string) {
    const [deletedRow] = await db
        .delete(chirps)
        .where(eq(chirps.id, id))
        .returning();

    return deletedRow;
}
