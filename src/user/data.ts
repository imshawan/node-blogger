import { database } from "@src/database";

export async function getUserByUsername(username: string) {
    if (!username) {
        throw new Error('username is required');
    }

    return await database.getObjects({username});   
}