import { isAdministrator, getUserRoles, validAccessUserRoles } from "@src/user";
import data from './data';
import { database } from "@src/database";
import nconf from 'nconf';
import { ICategory } from "@src/types";
import { sanitizeString } from "@src/utilities";

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

    const [category, subCategoriesSet] = await Promise.all([
        data.getCategoryByCid(id),
        database.fetchSortedSetsRange('category:' + id + ':child', 0, -1),
    ]);

    if (!category) {
        throw new Error('No such category was found with id ' + id);
    }

    const subCategories = await database.getObjectsBulk(subCategoriesSet);
    const promises = subCategories.map(async (item: ICategory) => await deleteCategoryWithData(item))

    promises.push(deleteCategoryWithData(category));
    
    await Promise.all(promises);
}

async function deleteCategoryWithData (categoryData: ICategory) {
    // TODO: Implement the relative data deletion with category
    let {cid, name, slug, userid, parent} = categoryData;
    let key = 'category:' + cid;

    name = String(sanitizeString(name ?? '')).toLowerCase();
    slug = String(sanitizeString(slug ?? '')).toLowerCase();

    const bulkRemoveSets = [
        ['category:cid', key],
        ['category:slug:' + slug, key],
        ['category:userid:' + userid, key],
        ['category:name', name + ':' + cid],
        ['category:child', key],
        ['category:parent', key],
        ['category:name:child', name + ':' + cid]
    ]

    if (parent) {
        bulkRemoveSets.push(['category:' + parent + ':child', key]);
    }

    await Promise.all([
        purgeAllTagsByWithCategoryId(Number(cid)),
        database.sortedSetRemoveKeys(bulkRemoveSets),
        database.deleteObjects('category:' + cid),
        database.removeSortedSetValue(/user:(.*):category:post/, key),
    ]);
}

async function purgeAllTagsByWithCategoryId(categoryId: number) {
    const tagSets = await database.fetchSortedSetsRange('category:' + categoryId + ':tag', 0, -1);
    if (tagSets.length) {
        await database.deleteObjectsWithKeys(tagSets);
    }
}