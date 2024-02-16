import { isAdministrator, getUserRoles } from "@src/user";
import {getUserByUserId} from './data';
import { database } from "@src/database";
import { isAuthorizedToDelete } from "@src/permissions";


export const deleteUser = async function deleteUser(id: any, callerId: number, hard?: Boolean | undefined) {
    if (isNaN(id)) {
        throw new Error(`id must be a number, found ${typeof id} instead`);
    }

    if (isNaN(callerId)) {
        throw new Error(`callerId must be a number, found ${typeof callerId} instead`);
    }

    if (id != callerId && !await isAuthorizedToDelete('user', callerId)) {
        throw new Error('caller requires elevated permissions for performing this operation');
    }

    hard = !!hard;
    const user = await getUserByUserId(id);
    if (!user) {
        throw new Error('No such user was found with userid ' + id);
    }
    
    await deleteUserWithData(id, hard);
}

async function deleteUserWithData (id: any, hard: Boolean) {
    // TODO: Implement the relative data deletion with category

    await Promise.all([
        database.deleteObjects('user:' + id),
        database.deleteObjects(`user:${id}:registeration`),
    ]);
}