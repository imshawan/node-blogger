import locales from "@src/locales";
import { getUserRoles } from "@src/user";

const validAccessUserRoles = ['administrator', 'globalModerator'];

export const isAuthorizedToDelete = async function isAuthorizedToDelete(entity: string, callerId: number) {
    // TODO: Implementation of entiry based permissions
    if (isNaN(callerId)) {
        throw new Error(locales.translate('api-errors:invalid_type', {field: 'callerId', expected: 'number', got: typeof callerId}));
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