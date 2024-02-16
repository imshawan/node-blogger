import { isAdministrator, getUserRoles, validAccessUserRoles } from "@src/user";
import data from './data';
import { database } from "@src/database";
import nconf from 'nconf';

export default async function deleteCategory(id: any, callerId: number) {
    if (isNaN(id)) {
        throw new Error(`id must be a number, found ${typeof id} instead`);
    }

    if (isNaN(callerId)) {
        throw new Error(`callerId must be a number, found ${typeof callerId} instead`);
    }

    let permissions = 0;
    const userRoles = await getUserRoles(callerId);

    validAccessUserRoles.forEach(role => {
        if (userRoles.includes(role)) {
            permissions++;
        }
    });

    // If in testing mode, a person need not be an admin
    if (!Boolean(permissions) && nconf.get('env') != 'test') {
        throw new Error('caller requires elevated permissions for performing this operation');
    }

    const category = await data.getCategoryByCid(id);
    if (!category) {
        throw new Error('No such category was found with id ' + id);
    }
    
    await deleteCategoryWithData(id);
}

async function deleteCategoryWithData (id: any) {
    // TODO: Implement the relative data deletion with category

    await database.deleteObjects('category:' + id);
}