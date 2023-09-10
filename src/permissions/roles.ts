import { getUserRoles } from "@src/user";

const validAccessUserRoles = ['administrator', 'globalModerator'];

export const isAuthorizedToDelete = async function isAuthorizedToDelete(entity: string, callerId: number) {
    // TODO: Implementation of entiry based permissions
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

    return Boolean(permissions);
}