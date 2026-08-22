import argon2 from "argon2";

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
